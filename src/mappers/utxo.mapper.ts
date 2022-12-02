import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Asset, Datum, Utxo } from '@tango-crypto/tango-ledger';
import { Script } from '@tango-crypto/tango-ledger/dist/src/models/script';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { DatumDto } from 'src/models/dto/Datum.dto';
import { ScriptDto } from 'src/models/dto/Script.dto';
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
      .forMember(dest => dest.has_script, mapFrom(src => src.has_script))
      .forMember(dest => dest.quantity, mapDefer<Utxo>(src => src.quantity ? fromValue(Number(src.quantity)) : ignore()))
      .forMember(dest => dest.policy_id, mapFrom(src => src.policy_id))
      .forMember(dest => dest.asset_name, mapFrom(src => src.asset_name))
      .forMember(dest => dest.fingerprint, mapFrom(src => src.fingerprint))
      .forMember(dest => dest.assets, mapDefer<Utxo>(src => src.assets ? fromValue(mapper.mapArray<Asset, AssetDto>(src.assets, 'AssetDto', 'Asset')) : ignore()))
      .forMember(dest => dest.inline_datum, mapDefer<Utxo>(src => src.inline_datum ? fromValue(mapper.map<Datum, DatumDto>(src.inline_datum, 'DatumDto', 'Datum')) : ignore()))
      .forMember(dest => dest.reference_script, mapDefer<Utxo>(src => src.reference_script ? fromValue(mapper.map<Script, ScriptDto>(src.reference_script, 'ScriptDto', 'Script')) : ignore()))
      .forMember(dest => dest.script, mapDefer<Utxo>(src => src.script ? fromValue(mapper.map<Script, ScriptDto>(src.script, 'ScriptDto', 'Script')) : ignore()))
      ;
    }
  }
}