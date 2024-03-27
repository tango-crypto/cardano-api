import { fromValue, createMap, ignore, mapDefer, mapFrom, forMember } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Datum } from '@tangocrypto/tango-ledger';
import { DatumDto } from 'src/models/dto/Datum.dto';
@Injectable()
export class DatumProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Datum, DatumDto>(mapper, 'Datum', 'DatumDto',
        forMember(dest => dest.hash, mapFrom(src => src.hash)),
        forMember(dest => dest.value, mapDefer<Datum>(src => src.value ? fromValue(src.value) : ignore())),
        forMember(dest => dest.value_raw, mapDefer<Datum>(src => src.value_raw ? fromValue(src.value_raw) : ignore())),
      );
    }
  }
}