import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookProfile } from './mappers/webhook.mapper';
import { RuleProfile } from './mappers/rule.mapper';
import { ConfigModule } from '@nestjs/config';
import { AccountService } from 'src/providers/account/account.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProfile, RuleProfile, AccountService]
})
export class WebhooksModule {}
