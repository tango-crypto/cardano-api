import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { DynamoDbService as DynamoClient } from '@tango-crypto/tango-dynamodb';
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
@Injectable()
export class WebhooksService {
    client: DynamoClient;
    table: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectMapper() private mapper: Mapper
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

    async findAll(accountId: string, size = 20, next = ''): Promise<PaginateResponse<WebhookDto>> {
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
      return { result: webhooks, nextPageToken: nextToken };
    }

    async findOne(accountId: string, id: string): Promise<WebhookDto> {
      const item = await this.client.getItem<Webhook>(this.table, {PK: `ACCOUNT#${accountId}`, SK: `WBH#${id}`});
      if (!item) {
        throw APIError.notFound(`webhook for id: ${id} and accountId: ${accountId}`);
      } 
      return this.mapper.mapArray([item], WebhookDto, Webhook)[0];
    }

    async update(accountId: string, id: string, webhook: Webhook): Promise<boolean> {
      const time = Date.now().toString();
      const keys = {
        PK: `ACCOUNT#${accountId}`,
        SK: `WBH#${id}`
      };
      webhook.update_date = time;
      const data = Object.keys(webhook).reduce((obj, key) => {
        if (webhook[key]) {
          obj[key] = webhook[key];
        }
        return obj;
      }, {})
      await this.client.updateItem(this.table, keys, data);
      return true;
    }

    async create(accountId: string, createWebhook: CreateWebhookDto): Promise<WebhookDto> {
      try {
        const webhook = this.mapper.mapArray([createWebhook], Webhook, CreateWebhookDto)[0];
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
          auth_token: webhook.auth_token,
          callback_url: webhook.callback_url,
          last_trigger_date: '-1',
          rules: webhook.rules || [],
          create_date: time,
          update_date: time,
          type: webhook.type,
          available: webhook.available
        };
        await this.client.putItem(this.table, attributes);
        return this.findOne(accountId, id);
      } catch (err) {
        throw APIError.badRequest(err.message);
      }
  }

  async remove(accountId: string, id: string): Promise<boolean> {
    const keys = {
			PK: `ACCOUNT#${accountId}`,
			SK: `WBH#${id}`,
		}
		await this.client.deleteItem(this.table, keys);
    return true;
  }

}
