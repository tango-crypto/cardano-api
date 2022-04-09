import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { DynamoDbService as DynamoClient, UPDATE_RETURN_NONE } from '@tango-crypto/tango-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { ConfigService } from '@nestjs/config';
import { Webhook } from './models/webhook.model';
import { WebhookDto } from './dto/webhook.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { AccountService } from 'src/providers/account/account.service';
import * as cardanoAddresses from 'cardano-addresses';
import { MeteringService } from 'src/providers/metering/metering.service';
@Injectable()
export class WebhooksService {
    client: DynamoClient;
    table: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly accountService: AccountService,
        private readonly meteringService: MeteringService,
        @InjectMapper('mapper') private mapper: Mapper
    ){
      const config: DynamoDBClientConfig = {
        region: this.configService.get<string>('AWS_REGION'),
      };
      const env = this.configService.get<string>('NODE_ENV');
      if (env == 'development') {
        config.credentials = fromIni({ profile: 'tangocrypto' });
      }

      this.client = new DynamoClient(config);
      this.table = this.configService.get<string>('DYNAMO_DB_ACCOUNT_TABLE_NAME');
    }

    async findAll(accountId: string, size = 50, next = ''): Promise<PaginateResponse<WebhookDto>> {
      const { items, nextToken } = await this.client.getItems<Webhook>(
        this.table,
        [
          { key: 'PK', expr: 'account' },
          { key: 'SK', expr: 'webhook', op: 'begins_with' },
        ],
        null,
        { account: `ACCOUNT#${accountId}`, webhook: 'WBH#' },
        null,
        size,
        next,
      );
      const webhooks = this.mapper.mapArray(items, WebhookDto, Webhook);
      return { data: webhooks, cursor: nextToken || null };
    }

    async findOne(accountId: string, id: string): Promise<WebhookDto> {
      const item = await this.client.getItem<Webhook>(this.table, {PK: `ACCOUNT#${accountId}`, SK: `WBH#${id}`});
      if (!item) {
        throw APIError.notFound(`webhook for id: ${id} and accountId: ${accountId}`);
      } 
      return this.mapper.mapArray([item], WebhookDto, Webhook)[0];
    }

    async update(accountId: string, id: string, updateWebhook: UpdateWebhookDto): Promise<WebhookDto> {
      const account = await this.accountService.getSubscription(accountId);
      if (!account) {
        throw APIError.notFound(`Account: ${accountId}`);
      }
      const allowConfirmations = this.accountService.allowWebhookConfirmations(account, updateWebhook.confirmations);
      if (!allowConfirmations) {
        throw APIError.badRequest(`Webhook confirmations not allowed for account: ${accountId}`);
      }

      const wbh = await this.findOne(accountId, id);
      updateWebhook.type = updateWebhook.type || wbh.type;
      updateWebhook.network = updateWebhook.network || wbh.network;
      updateWebhook.address = updateWebhook.address || wbh.address;
      await this.validateWebhookAddress(updateWebhook);

      const time = Date.now().toString();
      const keys = {
        PK: `ACCOUNT#${accountId}`,
        SK: `WBH#${id}`
      };
      const webhook = this.mapper.mapArray([updateWebhook], Webhook, UpdateWebhookDto)[0];
      webhook.update_date = time;
      const updateExpr = [];
      if (account.webhooks_active == 'true' && webhook.available == 'true') {
        webhook.active = 'true';
      } else if (webhook.available == 'false') {
        updateExpr.push({ key: 'active', expr: '', action: 'REMOVE' });
      }
      // remove undefined rules
      const data = Object.keys(webhook).reduce((obj, key) => {
        if (webhook[key] != undefined && webhook[key] != null) {
          obj[key] = webhook[key];
        }
        return obj;
      }, {});
      if (webhook.available == 'true' && wbh.available == 'false') {
        await this.meteringService.removeWebhookFails(accountId, id);
      }
      await this.client.updateItem(this.table, keys, data, null, UPDATE_RETURN_NONE, updateExpr);
      return this.findOne(accountId, id);;
    }

    async create(accountId: string, createWebhook: CreateWebhookDto): Promise<WebhookDto> {
      try {
        await this.validateWebhookAddress(createWebhook);
        const webhook = this.mapper.mapArray([createWebhook], Webhook, CreateWebhookDto)[0];
        const account = await this.accountService.getAccount(accountId);
        if (!account) {
          throw APIError.notFound(`Account: ${accountId}`);
        }
        if (account.subscription.webhooks_count <= account.webhooks.length) {
          throw APIError.badRequest(`Cannot create more than ${account.subscription.webhooks_count} webhooks`);
        }

        const allowConfirmations = this.accountService.allowWebhookConfirmations(account.subscription, webhook.confirmations);
        if (!allowConfirmations) {
          throw APIError.badRequest(`Webhook confirmations not allowed for account: ${accountId}`);
        }
        const time = Date.now().toString();
        const id = uuidv4().replace(/-/g, ''); 
        const attributes: Webhook = {
          PK: `ACCOUNT#${accountId}`,
          SK: `WBH#${id}`, 
          webhook_id: id,
          account_id: `ACCOUNT#${accountId}`,
          webhook_key: webhook.webhook_key, // WBH_PAYMENT, WBH_TRANSACTION, WBH_BLOCK, WBH_EPOCH, WBH_DELEGATION, addr_xxxxxx, etc.
          name: webhook.name,
          network: webhook.network,
          description: webhook.description || '',
          auth_token: account.subscription.webhook_auth_token,
          callback_url: webhook.callback_url,
          last_trigger_date: '-1',
          rules: webhook.rules || [],
          create_date: time,
          update_date: time,
          type: webhook.type,
          available: webhook.available,
          confirmations: webhook.confirmations,
        };
        if (account.subscription.webhooks_active == 'true' && attributes.available == 'true') {
          attributes.active = 'true';
        }
        await this.client.putItem(this.table, attributes);
        return this.findOne(accountId, id);
      } catch (err) {
        if (err instanceof NotFoundException) throw err;
        throw APIError.badRequest(err.message);
      }
  }

  async remove(accountId: string, id: string): Promise<boolean> {
    const keys = {
			PK: `ACCOUNT#${accountId}`,
			SK: `WBH#${id}`,
		}
    await this.meteringService.removeWebhookFails(accountId, id);
		await this.client.deleteItem(this.table, keys);
    return true;
  }

  private async validateWebhookAddress(webhook: UpdateWebhookDto | CreateWebhookDto) {
    if (webhook.type == 'payment') {
      try {
        const info = await cardanoAddresses.inspectAddress(webhook.address);
        const network_tag = info.address_type != 8 ? webhook.network == 'testnet' ? 0 : 1 : webhook.network == 'testnet' ? 1097911063 : null;
        if (info.network_tag != network_tag) {
          throw APIError.badRequest(`Invalid address ${webhook.address} for network: ${webhook.network}`);
        }
      } catch (err) {
        throw APIError.badRequest(`Invalid address ${webhook.address}`);
      }
    }
  }

}
