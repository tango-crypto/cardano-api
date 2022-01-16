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
      .forMember(dest => dest.id, mapFrom(src => src.webhook_id))
      .forMember(dest => dest.account_id, mapFrom(src => src.account_id.replace('ACCOUNT#', '')))
      .forMember(dest => dest.type, ignore());

      mapper.createMap(CreateWebhookDto, Webhook)
      .forMember(dest => dest.name, mapFrom(src => src.name))
      .forMember(dest => dest.description, mapFrom(src => src.description))
      .forMember(dest => dest.type, mapFrom(src => src.type))
      .forMember(dest => dest.callback_url, mapFrom(src => src.callback_url))
      .forMember(dest => dest.available, mapFrom(src => src.available === "true" ? "true" : "false"))
      .forMember(dest => dest.rules, mapFrom(src => src.rules))
      .forMember(dest => dest.create_date, mapFrom(src => src.create_date))
      .forMember(dest => dest.update_date, mapFrom(src => src.update_date))
      .forMember(dest => dest.webhook_key, mapFrom(src => src.webhook_key))
      .forMember(dest => dest.auth_token, mapFrom(src => src.auth_token))

      mapper.createMap(UpdateWebhookDto, Webhook)
      .forMember(dest => dest.name, mapFrom(src => src.name))
      .forMember(dest => dest.description, mapFrom(src => src.description))
      .forMember(dest => dest.callback_url, mapFrom(src => src.callback_url))
      .forMember(dest => dest.available, mapFrom(src => src.available === "true" ? "true" : "false"))
      .forMember(dest => dest.rules, mapFrom(src => src.rules))
      .forMember(dest => dest.update_date, mapFrom(src => src.update_date))
      .forMember(dest => dest.webhook_key, mapFrom(src => src.webhook_key))
      ;
    };
  }
}