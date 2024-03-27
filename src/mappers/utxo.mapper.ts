import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Asset, Datum, Utxo } from '@tangocrypto/tango-ledger';
import { Script } from '@tangocrypto/tango-ledger/dist/src/models/script';
import { AssetDto } from '../models/dto/Asset.dto';
import { DatumDto } from '../models/dto/Datum.dto';
import { ScriptDto } from '../models/dto/Script.dto';
import { UtxoDto } from '../models/dto/Utxo.dto';

@Injectable()
export class UtxoProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Utxo, UtxoDto>(mapper, 'Utxo', 'UtxoDto', 
        forMember(dest => dest.tx_id, ignore()),
        forMember(dest => dest.address, mapFrom(src => src.address)),
        forMember(dest => dest.hash, mapFrom(src => src.hash)),
        forMember(dest => dest.index, mapFrom(src => Number(src.index))),
        forMember(dest => dest.value, mapFrom(src => Number(src.value))),
        forMember(dest => dest.has_script, mapFrom(src => src.has_script)),
        forMember(dest => dest.quantity, mapDefer<Utxo>(src => src.quantity ? fromValue(Number(src.quantity)) : ignore())),
        forMember(dest => dest.policy_id, mapFrom(src => src.policy_id)),
        forMember(dest => dest.asset_name, mapFrom(src => src.asset_name)),
        forMember(dest => dest.fingerprint, mapFrom(src => src.fingerprint)),
        forMember(dest => dest.assets, mapDefer<Utxo>(src => src.assets ? fromValue(mapper.mapArray<Asset, AssetDto>(src.assets, 'Asset', 'AssetDto')) : ignore())),
        forMember(dest => dest.datum, mapDefer<Utxo>(src => src.datum ? fromValue(mapper.map<Datum, DatumDto>(src.datum, 'Datum', 'DatumDto')) : ignore())),
        forMember(dest => dest.inline_datum, mapDefer<Utxo>(src => src.inline_datum ? fromValue(mapper.map<Datum, DatumDto>(src.inline_datum, 'Datum', 'DatumDto')) : ignore())),
        forMember(dest => dest.reference_script, mapDefer<Utxo>(src => src.reference_script ? fromValue(mapper.map<Script, ScriptDto>(src.reference_script, 'Script', 'ScriptDto', )) : ignore())),
        forMember(dest => dest.script, mapDefer<Utxo>(src => src.script ? fromValue(mapper.map<Script, ScriptDto>(src.script, 'Script', 'ScriptDto')) : ignore())),
        )
      ;
    }
  }
}