import { fromValue, ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dto/create-webhook.dto';
import { UpdateWebhookDto } from '../dto/update-webhook.dto';
import { WebhookDto } from '../dto/webhook.dto';
import { Webhook } from '../models/webhook.model';


@Injectable()
export class WebhookProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap(Webhook, WebhookDto)
      .forMember(dest => dest.id, mapFrom(src => src.SK.replace('WBH#', '')))
      .forMember(dest => dest.userId, mapFrom(src => src.PK.replace('Account#', '')))
      .forMember(dest => dest.network, mapFrom(src => src.network))
      .forMember(dest => dest.type, ignore())
      .forMember(dest => dest.last_trigger_date, mapFrom(src => src.last_trigger_date))
      .forMember(dest => dest.available, mapFrom(src => src.available));

      mapper.createMap(CreateWebhookDto, Webhook)
      .forMember(dest => dest.type, fromValue('webhooks'))
      .forMember(dest => dest.last_trigger_date, fromValue('-1'))
      .forMember(dest => dest.available, fromValue('true'))
      .forMember(dest => dest.rules, mapFrom(src => src.rules || []));

      mapper.createMap(UpdateWebhookDto, Webhook)
      .forMember(dest => dest.name, mapFrom(src => src.name))
      .forMember(dest => dest.description, mapFrom(src => src.description))
      .forMember(dest => dest.webhook_type, mapFrom(src => src.webhook_type))
      .forMember(dest => dest.callback_url, mapFrom(src => src.callback_url))
      .forMember(dest => dest.rules, mapFrom(src => src.rules || undefined))
      .forMember(dest => dest.available, mapFrom(src => src.available.toString()));
    };
  }
}