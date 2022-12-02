import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Datum, Redeemer, Script } from '@tango-crypto/tango-ledger';
import { DatumDto } from 'src/models/dto/Datum.dto';
import { RedeemerDto } from 'src/models/dto/Redeemer.dto';
import { ScriptDto } from 'src/models/dto/Script.dto';

@Injectable()
export class ScriptProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Script, ScriptDto>('Script', 'ScriptDto')
      .forMember(dest => dest.type, mapFrom(src => src.type))
      .forMember(dest => dest.hash, mapFrom(src => src.hash))
      .forMember(dest => dest.json, mapDefer<Script>(src => src.json ? fromValue(src.json) : ignore()))
      .forMember(dest => dest.code, mapDefer<Script>(src => src.code ? fromValue(src.code) : ignore()))
      .forMember(dest => dest.serialised_size, mapDefer<Script>(src => src.serialised_size ? fromValue(Number(src.serialised_size)) : ignore()))
      .forMember(dest => dest.datum, mapDefer<Script>(src => src.datum ? fromValue(mapper.map<Datum, DatumDto>(src.datum, 'DatumDto', 'Datum')) : ignore()))
      .forMember(dest => dest.redeemer, mapDefer<Script>(src => src.redeemer ? fromValue(mapper.map<Redeemer, RedeemerDto>(src.redeemer, 'RedeemerDto', 'Redeemer')) : ignore()))
      ;

      mapper.createMap<Redeemer, RedeemerDto>('Redeemer', 'RedeemerDto')
      .forMember(dest => dest.hash, mapDefer<Redeemer>(src => src.hash ? fromValue(src.hash) : ignore()))
      .forMember(dest => dest.index, mapFrom(src => src.index))
      .forMember(dest => dest.unit_mem, mapFrom(src => Number(src.unit_mem)))
      .forMember(dest => dest.unit_steps, mapFrom(src => Number(src.unit_steps)))
      .forMember(dest => dest.fee, mapDefer<Redeemer>(src => src.fee ? fromValue(Number(src.fee)) : ignore()))
      .forMember(dest => dest.purpose, mapFrom(src => src.purpose))
      .forMember(dest => dest.script_hash, mapDefer<Redeemer>(src => src.script_hash ? fromValue(src.script_hash) : ignore()))
      .forMember(dest => dest.data, mapDefer<Redeemer>(src => src.data ? fromValue(mapper.map<Datum, DatumDto>(src.data, 'DatumDto', 'Datum')) : ignore()))
      ;
    }
  }
}