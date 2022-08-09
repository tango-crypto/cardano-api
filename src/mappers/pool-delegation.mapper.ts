import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  PoolDelegation } from '@tango-crypto/tango-ledger';
import { PoolDelegationDto } from 'src/models/dto/PoolDelegation.dto';

@Injectable()
export class PoolDelegationProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<PoolDelegation, PoolDelegationDto>('PoolDelegation', 'PoolDelegationDto')
      .forMember(dest => dest.tx_id, ignore())
      .forMember(dest => dest.stake_address, mapFrom(src => src.stake_address))
      .forMember(dest => dest.available_rewards, mapFrom(src => Number(src.available_rewards)))
      .forMember(dest => dest.stake, mapFrom(src => Number(src.stake)))
      ;
    }
  }
}