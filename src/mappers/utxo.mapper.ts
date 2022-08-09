import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Asset, Utxo } from '@tango-crypto/tango-ledger';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';

@Injectable()
export class UtxoProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Utxo, UtxoDto>('Utxo', 'UtxoDto')
      .forMember(dest => dest.tx_id, ignore())
      .forMember(dest => dest.address, mapFrom(src => src.address))
      .forMember(dest => dest.hash, mapFrom(src => src.hash))
      .forMember(dest => dest.index, mapFrom(src => Number(src.index)))
      .forMember(dest => dest.value, mapFrom(src => Number(src.value)))
      .forMember(dest => dest.smart_contract, mapFrom(src => src.smart_contract))
      .forMember(dest => dest.quantity, mapDefer<Utxo>(src => src.quantity ? fromValue(Number(src.quantity)) : ignore()))
      .forMember(dest => dest.policy_id, mapFrom(src => src.policy_id))
      .forMember(dest => dest.asset_name, mapFrom(src => src.asset_name))
      .forMember(dest => dest.fingerprint, mapFrom(src => src.fingerprint))
      .forMember(dest => dest.assets, mapDefer<Utxo>(src => src.assets ? fromValue(mapper.mapArray<Asset, AssetDto>(src.assets, 'AssetDto', 'Asset')) : ignore()))
      ;
    }
  }
}