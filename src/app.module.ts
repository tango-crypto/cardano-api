import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EpochsService } from './epochs/epochs.service';
import { EpochsController } from './epochs/epochs.controller';
import { TangoLedgerService } from './providers/tango-ledger/tango-ledger.service';
import { ConfigModule } from '@nestjs/config';
import { PoolsController } from './pools/pools.controller';
import { PoolsService } from './pools/pools.service';
import { AddressesController } from './addresses/addresses.controller';
import { AddressesService } from './addresses/addresses.service';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { BlocksController } from './blocks/blocks.controller';
import { BlocksService } from './blocks/blocks.service';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';
import { WalletsController } from './wallets/wallets.controller';
import { StakesService } from './wallets/stakes.service';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { WebhooksModule } from './webhooks/webhooks.module';

const ENV = process.env.NETWORK || 'testnet';
console.log('ENV:', ENV);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${ENV}`
    }),
    AutomapperModule.forRoot({
      options: [{ name: 'mapper', pluginInitializer: classes }],
      singular: true,
    }),
    WebhooksModule
  ],
  controllers: [EpochsController, PoolsController, AddressesController, AssetsController, BlocksController, TransactionsController, WalletsController],
  providers: [EpochsService, TangoLedgerService, PoolsService, AddressesService, AssetsService, BlocksService, TransactionsService, StakesService],
})
export class AppModule {}
