import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/providers/account/account.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScyllaService } from 'src/providers/scylla/scylla.service';
import { SubscriptionService } from 'src/providers/account/subscription.service';
import { ApplicationService } from 'src/providers/account/application.service';
import { WebhookService } from 'src/providers/account/webhook.service';

@Module({
  imports: [
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService, AccountService, ConfigService, ScyllaService, SubscriptionService, ApplicationService, WebhookService]
})
export class AuthModule {}
