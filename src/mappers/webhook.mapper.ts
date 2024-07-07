import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Webhook } from 'src/webhooks/models/webhook.model';
import { WebhookDto } from 'src/webhooks/dto/webhook.dto';

@Injectable()
export class WebhookProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Webhook, WebhookDto>(mapper, 'Webhook', 'WebhookDto',
        forMember(dest => dest.id, mapFrom(src => src.webhook_id)),
        forMember(dest => dest.name, mapFrom(src => src.name)),
        forMember(dest => dest.network, mapFrom(src => src.network)),
        forMember(dest => dest.description, mapFrom(src => src.description)),
        forMember(dest => dest.callback_url, mapFrom(src => src.callback_url)),
        forMember(dest => dest.rules, mapFrom(src => src.rules)),
        forMember(dest => dest.create_date, mapFrom(src => src.create_date)),
        forMember(dest => dest.update_date, mapFrom(src => src.update_date)),
        forMember(dest => dest.available, mapFrom(src => src.active)),
        forMember(dest => dest.type, mapFrom(src => src.webhook_key.startsWith('addr') ? 'WBH_PAYMENT' : src.webhook_key)),
        forMember(dest => dest.address, mapDefer<Webhook>(src => src.webhook_key.startsWith('addr') ? fromValue(src.webhook_key) : ignore())),
      );
    }
  }
}