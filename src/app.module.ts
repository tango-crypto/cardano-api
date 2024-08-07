import { Logger, Module } from '@nestjs/common';
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
import { EpochProfile } from './mappers/epoch.mapper';
import { EpochParametersProfile } from './mappers/epoch-parameters.mapper';
import { PoliciesService } from './policies/policies.service';
import { PoliciesController } from './policies/policies.controller';
import { MeteringService } from './providers/metering/metering.service';
import { ScriptProfile } from './mappers/script.mapper';
import { DatumProfile } from './mappers/datum.mapper';
import { ScriptsController } from './scripts/scripts.controller';
import { ScriptsService } from './scripts/scripts.service';
import { DatumsController } from './datums/datums.controller';
import { DatumsService } from './datums/datums.service';
import { OgmiosService } from './providers/ogmios/ogmios.service';
import { ValueProfile } from './mappers/value.mapper';
import { AuthModule } from './auth/auth.module';
import { ScyllaService } from './providers/scylla/scylla.service';
@Module({
  imports: [
    ConfigModule.forRoot(),
    AutomapperModule.forRoot(
      [
        { name: 'mapper', strategyInitializer: classes() }, 
        { name: 'pojo-mapper', strategyInitializer: pojos() }
      ],
    ),
    WebhooksModule,
    AuthModule
  ],
  controllers: [AppController, EpochsController, PoolsController, AddressesController, AssetsController, BlocksController, TransactionsController, WalletsController, PoliciesController, ScriptsController, DatumsController],
  providers: [AppService, EpochsService, TangoLedgerService, PoolsService, AddressesService, AssetsService, BlocksService, TransactionsService, StakesService, EpochProfile, EpochParametersProfile, PoolProfile, PoolDelegationProfile, BlockProfile, TransactionProfile, UtxoProfile, ValueProfile, StakeProfile, AddressProfile, AssetProfile, MetadataProfile, ScriptProfile, DatumProfile, PoliciesService, MeteringService, ScriptsService, DatumsService, OgmiosService, ScyllaService, Logger],
})
export class AppModule {}
