import { createMap, forMember, ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Pool } from '@tangocrypto/tango-ledger';
import { PoolDto } from 'src/models/dto/Pool.dto';

@Injectable()
export class PoolProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Pool, PoolDto>(mapper, 'Pool', 'PoolDto',
        forMember(dest => dest.id, mapFrom(src => src.id)),
        forMember(dest => dest.pool_id, mapFrom(src => src.pool_id)),
        forMember(dest => dest.pledge, mapFrom(src => Number(src.pledge))),
        forMember(dest => dest.margin, mapFrom(src => Number(src.margin))),
        forMember(dest => dest.fixed_cost, mapFrom(src => Number(src.fixed_cost))),
        forMember(dest => dest.active_epoch_no, mapFrom(src => Number(src.active_epoch_no))),
        forMember(dest => dest.url, mapFrom(src => src.url)),
        forMember(dest => dest.hash, mapFrom(src => src.hash)),
        forMember(dest => dest.ticker, mapFrom(src => src.ticker)),
        forMember(dest => dest.name, mapFrom(src => src.name)),
        forMember(dest => dest.description, mapFrom(src => src.description)),
        forMember(dest => dest.homepage, mapFrom(src => src.homepage)),
      );
    }
  }
}