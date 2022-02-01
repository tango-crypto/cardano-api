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
import { AssetProfile } from './mappers/asset.mapper';
import { pojos } from '@automapper/pojos';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AutomapperModule.forRoot({
      options: [{ name: 'mapper', pluginInitializer: classes }, {name: 'pojo-mapper', pluginInitializer: pojos}],
      // singular: true,
    }),
    WebhooksModule
  ],
  controllers: [AppController, EpochsController, PoolsController, AddressesController, AssetsController, BlocksController, TransactionsController, WalletsController],
  providers: [AppService, EpochsService, TangoLedgerService, PoolsService, AddressesService, AssetsService, BlocksService, TransactionsService, StakesService, AssetProfile],
})
export class AppModule {}
