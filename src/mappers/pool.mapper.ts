import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Pool } from '@tango-crypto/tango-ledger';
import { PoolDto } from 'src/models/dto/Pool.dto';

@Injectable()
export class PoolProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Pool, PoolDto>('Pool', 'PoolDto')
      .forMember(dest => dest.pool_id, mapFrom(src => src.pool_id))
      .forMember(dest => dest.raw_id, ignore())
      .forMember(dest => dest.id, mapFrom(src => src.raw_id))
      .forMember(dest => dest.url, mapFrom(src => src.url))
      .forMember(dest => dest.hash, mapFrom(src => src.hash))
      .forMember(dest => dest.ticker, mapFrom(src => src.ticker))
      .forMember(dest => dest.name, mapFrom(src => src.name))
      .forMember(dest => dest.description, mapFrom(src => src.description))
      .forMember(dest => dest.homepage, mapFrom(src => src.homepage))
      ;
    }
  }
}