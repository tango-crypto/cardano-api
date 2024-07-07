import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { ConfigService } from '@nestjs/config';
import { Webhook } from './models/webhook.model';
import { WebhookDto } from './dto/webhook.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { AccountService } from 'src/providers/account/account.service';
import * as cardanoAddresses from 'cardano-addresses';
import { MeteringService } from 'src/providers/metering/metering.service';
import { WebhookProvider } from 'src/providers/webhooks/webhook.provider';
@Injectable()
export class WebhooksService {
    table: string;

    constructor(
        private webhookProvider: WebhookProvider,
        @InjectMapper('pojo-mapper') private mapper: Mapper
    ){
    }

    async findAll(accountId: string, size = 50, next?: string): Promise<PaginateResponse<WebhookDto>> {
      const {items, state } = await this.webhookProvider.findAll(accountId, next, size);
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

    async update(accountId: string, id: string, updateWebhook: UpdateWebhookDto): Promise<WebhookDto> {
      throw new Error("Not implemented");
    }

    async create(accountId: string, createWebhook: CreateWebhookDto): Promise<WebhookDto> {
      throw new Error("Not implemented");
  }

  async remove(accountId: string, id: string): Promise<boolean> {
    throw new Error("Not implemented");
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
