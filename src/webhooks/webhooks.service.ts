import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { Webhook } from './models/webhook.model';
import { WebhookDto } from './dto/webhook.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhookProvider } from 'src/providers/webhooks/webhook.provider';
import { SubscriptionService } from 'src/providers/account/subscription.service';
import * as cardanoAddresses from 'cardano-addresses';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class WebhooksService {
  table: string;

  constructor(
    private webhookProvider: WebhookProvider,
    private subscriptioService: SubscriptionService,
    @InjectMapper('pojo-mapper') private mapper: Mapper
  ) {
  }

  async findAll(accountId: string, size = 50, next?: string): Promise<PaginateResponse<WebhookDto>> {
    const { items, state } = await this.webhookProvider.findAll(accountId, next, size);
    const data = this.mapper.mapArray<Webhook, WebhookDto>(items, 'Webhook', 'WebhookDto');
    return { data: data, cursor: state };
  }

  async findOne(userId: string, id: string): Promise<WebhookDto> {
    const webhook = await this.webhookProvider.findOne(userId, id);
    if (webhook) {
      return this.mapper.map<Webhook, WebhookDto>(webhook, 'Webhook', 'WebhookDto');
    } else {
      throw APIError.notFound(`webhook for id: ${id} and userId: ${userId}`);
    }
  }

  async update(userId: string, id: string, updateWebhook: UpdateWebhookDto): Promise<WebhookDto> {
    const data = this.cleanData(this.mapper.map<UpdateWebhookDto, Webhook>(updateWebhook, 'UpdateWebhookDto', 'Webhook'));
    const time = new Date();
    const webhook = await this.webhookProvider.update(userId, id, {...data, update_date: time.toISOString()});
    if (!webhook) {
      throw APIError.notFound(`webhook for id: ${id} and userId: ${userId}`);
    }

    return this.findOne(userId, id);
  }

  async create(userId: string, createWebhook: CreateWebhookDto): Promise<WebhookDto> {
    const subscription = await this.subscriptioService.findOne(userId);
    if (!subscription) {
      throw APIError.notFound(`Invalid user id: ${userId}`);
    }

    const data = this.cleanData(this.mapper.map<CreateWebhookDto, Webhook>(createWebhook, 'CreateWebhookDto', 'Webhook'));
    const time = new Date();
    const id = uuidv4().replace(/-/g, ''); 
    const webhook = await this.webhookProvider.create(userId, id, 
      {
        ...data, 
        auth_token: subscription.webhooks_auth_token, 
        create_date: time.toISOString()
      }
    );
    if (!webhook) {
      throw APIError.notFound(`webhook for id: ${id} and userId: ${userId}`);
    }

    return this.findOne(userId, id);

  }

  async remove(userId: string, id: string): Promise<boolean> {
    const deleted = await this.webhookProvider.delete(userId, id);
    if (!deleted) {
      throw APIError.notFound(`webhook for id: ${id} and userId: ${userId}`);
    }
    return true;
  }

  private cleanData(data: any): { [key: string]: any } {
    const obj = {};
    for (const [key, value] of Object.entries(data)) {
      if (value != undefined) {
        obj[key] = value;
      }
    }
    return obj;
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
