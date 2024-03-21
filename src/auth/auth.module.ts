import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/providers/account/account.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { ScyllaService } from 'src/providers/scylla/scylla.service';
import { SubscriptionService } from 'src/providers/account/subscription.service';
import { ApplicationService } from 'src/providers/account/application.service';
import { WebhookService } from 'src/providers/account/webhook.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ApiThrottlerGuard } from './ratelimit.guard';
import { ThrottlerStorageRedisService } from 'src/providers/metering/throttler-storage-redis.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ limit: config.get<number>('THROTTLE_LIMIT'), ttl: config.get<number>('THROTTLE_INTERVAL') }],
        storage: new ThrottlerStorageRedisService(config)
      }),
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard
    },
    AuthService, AccountService, ConfigService, ScyllaService, SubscriptionService, ApplicationService, WebhookService]
})
export class AuthModule {}
