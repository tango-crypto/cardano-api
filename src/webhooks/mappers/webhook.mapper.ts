import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { RuleDto } from '../dto/rule.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookDto } from '../dto/webhook.dto';
import { Rule } from '../models/rule.model';
import { Webhook } from '../models/webhook.model';


@Injectable()
export class WebhookProfile extends AutomapperProfile {
  constructor(@InjectMapper('mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap(Webhook, WebhookDto)
      .forMember(dest => dest.id, mapFrom(src => src.webhook_id))
      .forMember(dest => dest.type, mapFrom(src => src.webhook_key.startsWith('addr') ? 'payment': webhookTypeMap[src.webhook_key]))
      .forMember(dest => dest.address, mapDefer<Webhook>(src => src.webhook_key.startsWith('addr') ? fromValue(src.webhook_key) : ignore()))
      .forMember(dest => dest.create_date, mapFrom(src => new Date(Number(src.create_date)).toISOString()))
      .forMember(dest => dest.update_date, mapFrom(src => new Date(Number(src.update_date)).toISOString()))
      ;

      mapper.createMap(CreateWebhookDto, Webhook)
      .forMember(dest => dest.network, mapFrom(src => src.network))
      .forMember(dest => dest.name, mapFrom(src => src.name))
      .forMember(dest => dest.description, mapFrom(src => src.description))
      .forMember(dest => dest.type, fromValue("webhooks"))
      .forMember(dest => dest.callback_url, mapFrom(src => src.callback_url))
      .forMember(dest => dest.available, mapFrom(src => src.available === "false" ? "false" : "true"))
      .forMember(dest => dest.rules, mapFrom(src => mapper.mapArray(src.rules, Rule, RuleDto)))
      .forMember(dest => dest.create_date, ignore())
      .forMember(dest => dest.update_date, ignore())
      .forMember(dest => dest.webhook_key, mapFrom(src => src.type == "payment" ? src.address : webhookTypeMap[src.type]))
      .forMember(dest => dest.confirmations, mapFrom(src => src.confirmations || 0))

      mapper.createMap(UpdateWebhookDto, Webhook)
      .forMember(dest => dest.network, mapDefer<UpdateWebhookDto>(src => src.network ? fromValue(src.network) : ignore()))
      .forMember(dest => dest.name, mapDefer<UpdateWebhookDto>(src => src.name ? fromValue(src.name) : ignore()))
      .forMember(dest => dest.description, mapDefer<UpdateWebhookDto>(src => src.description != undefined && src.description != null ? fromValue(src.description) : ignore()))
      .forMember(dest => dest.callback_url, mapDefer<UpdateWebhookDto>(src => src.callback_url ? fromValue(src.callback_url) : ignore()))
      .forMember(dest => dest.rules, mapDefer<UpdateWebhookDto>(src => src.rules ? fromValue(mapper.mapArray(src.rules, Rule, RuleDto)) : ignore()))
      .forMember(dest => dest.available, mapDefer<UpdateWebhookDto>(src => src.available ? src.available === "false" ? fromValue("false") : fromValue("true") : ignore()))
      .forMember(dest => dest.webhook_key, mapDefer<UpdateWebhookDto>(src => src.type ? src.type == "payment" ? fromValue(src.address) : fromValue(webhookTypeMap[src.type]) : ignore()))
      .forMember(dest => dest.update_date, ignore())
      .forMember(dest => dest.create_date, ignore())
      .forMember(dest => dest.type, ignore())
      .forMember(dest => dest.confirmations, mapDefer<UpdateWebhookDto>(src => src.confirmations != null && src.confirmations != undefined ? fromValue(src.confirmations) : ignore()))
      ;
    };
  }
}


const webhookTypeMap = {
  'epoch': 'WBH_EPOCH',
  'block': 'WBH_BLOCK',
  'transaction': 'WBH_TRANSACTION',
  'delegation': 'WBH_DELEGATION',
  'WBH_EPOCH': 'epoch',
  'WBH_BLOCK': 'block',
  'WBH_TRANSACTION': 'transaction',
  'WBH_DELEGATION': 'delegation'
};