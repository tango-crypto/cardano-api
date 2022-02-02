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
import { UtxoProfile } from './mappers/utxo.mapper';
import { MetadataProfile } from './mappers/metadata.mapper';
import { TransactionProfile } from './mappers/transaction.mapper';
import { BlockProfile } from './mappers/block.mapper';
import { PoolProfile } from './mappers/pool.mapper';
import { PoolDelegationProfile } from './mappers/pool-delegation.mapper';
import { StakeProfile } from './mappers/stake.mapper';
import { AddressProfile } from './mappers/address.mapper';
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
  providers: [AppService, EpochsService, TangoLedgerService, PoolsService, AddressesService, AssetsService, BlocksService, TransactionsService, StakesService, PoolProfile, PoolDelegationProfile, BlockProfile, TransactionProfile, UtxoProfile, StakeProfile, AddressProfile, AssetProfile, MetadataProfile],
})
export class AppModule {}
