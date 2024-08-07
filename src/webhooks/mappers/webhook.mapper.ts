import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { RuleDto } from '../dto/rule.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookDto } from '../dto/webhook.dto';
import { Rule } from '../models/rule.model';
import { Webhook } from '../models/webhook.model';
import { staticWebhookType, webhookTypeMap } from '../validators/webhook.validator';


@Injectable()
export class WebhookProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Webhook, WebhookDto>(mapper, 'Webhook', 'WebhookDto',
        forMember(dest => dest.id, mapFrom(src => src.webhook_id)),
        forMember(dest => dest.type, mapFrom(src => staticWebhookType.includes(src.webhook_key) ? webhookTypeMap[src.webhook_key] : 'payment')),
        forMember(dest => dest.address, mapDefer<Webhook>(src => staticWebhookType.includes(src.webhook_key) ? ignore() : fromValue(src.webhook_key))),
        forMember(dest => dest.name, mapFrom(src => src.name)),
        forMember(dest => dest.network, mapFrom(src => src.network)),
        forMember(dest => dest.description, mapFrom(src => src.description)),
        forMember(dest => dest.callback_url, mapFrom(src => src.callback_url)),
        forMember(dest => dest.available, mapFrom(src => src.active)),
        forMember(dest => dest.rules, mapDefer<Webhook>(src => src.rules ? fromValue(mapper.mapArray<Rule, RuleDto>(src.rules, 'Rule', 'RuleDto')) : fromValue([]))),
        forMember(dest => dest.create_date, mapFrom(src => new Date(Number(src.create_date)).toISOString())),
        forMember(dest => dest.update_date, mapFrom(src => new Date(Number(src.update_date)).toISOString())),
      );

      createMap<CreateWebhookDto, Webhook>(mapper, 'CreateWebhookDto', 'Webhook',
        forMember(dest => dest.network, mapFrom(src => src.network)),
        forMember(dest => dest.name, mapFrom(src => src.name)),
        forMember(dest => dest.description, mapFrom(src => src.description)),
        forMember(dest => dest.type, ignore()),
        forMember(dest => dest.callback_url, mapFrom(src => src.callback_url)),
        forMember(dest => dest.active, mapFrom(src => src.available != undefined && src.available)),
        forMember(dest => dest.rules, mapDefer<CreateWebhookDto>(src => src.rules ? fromValue(mapper.mapArray<RuleDto, Rule>(src.rules, 'RuleDto', 'Rule')) : ignore())),
        forMember(dest => dest.create_date, ignore()),
        forMember(dest => dest.update_date, ignore()),
        forMember(dest => dest.webhook_key, mapFrom(src => src.type == "payment" ? src.address : webhookTypeMap[src.type])),
        forMember(dest => dest.confirmations, mapFrom(src => src.confirmations || 0)),
      );

      createMap<UpdateWebhookDto, Webhook>(mapper, 'UpdateWebhookDto', 'Webhook',
        forMember(dest => dest.network, mapDefer<UpdateWebhookDto>(src => src.network ? fromValue(src.network) : ignore())),
        forMember(dest => dest.name, mapDefer<UpdateWebhookDto>(src => src.name ? fromValue(src.name) : ignore())),
        forMember(dest => dest.description, mapDefer<UpdateWebhookDto>(src => src.description != undefined && src.description != null ? fromValue(src.description) : ignore())),
        forMember(dest => dest.callback_url, mapDefer<UpdateWebhookDto>(src => src.callback_url ? fromValue(src.callback_url) : ignore())),
        forMember(dest => dest.rules, mapDefer<UpdateWebhookDto>(src => src.rules ? fromValue(mapper.mapArray<RuleDto, Rule>(src.rules, 'RuleDto', 'Rule')) : ignore())),
        forMember(dest => dest.active, mapDefer<UpdateWebhookDto>(src => src.available != undefined ? (src.available == false) ? fromValue(false) : fromValue(true) : ignore())),
        forMember(dest => dest.webhook_key, mapDefer<UpdateWebhookDto>(src => src.address ? fromValue(src.address) : src.type ? fromValue(webhookTypeMap[src.type]) : ignore())),
        forMember(dest => dest.update_date, ignore()),
        forMember(dest => dest.create_date, ignore()),
        forMember(dest => dest.type, ignore()),
        forMember(dest => dest.confirmations, mapFrom(src => src.confirmations || 0)),
      );
    };
  }
}