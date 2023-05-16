import { mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Value } from '../models/Value';
import { ValueDto } from '../models/dto/Value.dto';

@Injectable()
export class ValueProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Value, ValueDto>('Value', 'ValueDto')
      .forMember(dest => dest.lovelace, mapFrom(src => src.coin))
      .forMember(dest => dest.assets, mapFrom(src => [...src.assets.values()]))
      ;
    }
  }
}