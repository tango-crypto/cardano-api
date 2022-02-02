import { mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Stake } from '@tango-crypto/tango-ledger';
import { StakeDto } from 'src/models/dto/Stake.dto';

@Injectable()
export class StakeProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Stake, StakeDto>('Stake', 'StakeDto')
      .forMember(dest => dest.pool_id, mapFrom(src => src.pool_id))
      .forMember(dest => dest.active, mapFrom(src => src.active))
      .forMember(dest => dest.active_epoch, mapFrom(src => src.active_epoch))
      .forMember(dest => dest.controlled_total_stake, mapFrom(src => src.controlled_total_stake))
      .forMember(dest => dest.rewards_sum, mapFrom(src => src.rewards_sum))
      .forMember(dest => dest.withdrawals_sum, mapFrom(src => src.withdrawals_sum))
      .forMember(dest => dest.reserves_sum, mapFrom(src => src.reserves_sum))
      .forMember(dest => dest.treasury_sum, mapFrom(src => src.treasury_sum))
      .forMember(dest => dest.withdraw_available, mapFrom(src => src.withdraw_available))
      ;
    }
  }
}