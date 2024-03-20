import { Module } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookProfile } from './mappers/webhook.mapper';
import { RuleProfile } from './mappers/rule.mapper';
import { ConfigModule } from '@nestjs/config';
import { AccountService } from 'src/providers/account/account.service';
import { MeteringService } from 'src/providers/metering/metering.service';
import { ScyllaService } from 'src/providers/scylla/scylla.service';
import { SubscriptionService } from 'src/providers/account/subscription.service';
import { WebhookService } from 'src/providers/account/webhook.service';
import { ApplicationService } from 'src/providers/account/application.service';

@Module({
  imports: [ConfigModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookProfile, RuleProfile, AccountService, MeteringService, ScyllaService, SubscriptionService, ApplicationService, WebhookService]
})
export class WebhooksModule {}
