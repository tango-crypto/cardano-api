import { mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Asset } from '@tango-crypto/tango-ledger';
import { AssetDto } from 'src/models/dto/Asset.dto';

@Injectable()
export class AssetProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Asset, AssetDto>('Asset', 'AssetDto')
      .forMember(dest => dest.quantity, mapFrom(src => src.quantity))
      .forMember(dest => dest.policy_id, mapFrom(src => src.policy_id))
      .forMember(dest => dest.asset_name, mapFrom(src => src.asset_name))
      .forMember(dest => dest.mint_or_burn_count, mapFrom(src => src.mint_or_burn_count))
      .forMember(dest => dest.initial_mint_tx_hash, mapFrom(src => src.initial_mint_tx_hash))
      .forMember(dest => dest.on_chain_metadata, mapFrom(src => src.on_chain_metadata))
      .forMember(dest => dest.fingerprint, mapFrom(src => src.fingerprint))
      .forMember(dest => dest.metadata, mapFrom(src => src.metadata))
      ;
    }
  }
}