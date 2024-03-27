import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Stake } from '@tangocrypto/tango-ledger';
import { StakeDto } from 'src/models/dto/Stake.dto';

@Injectable()
export class StakeProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Stake, StakeDto>(mapper, 'Stake', 'StakeDto',
        forMember(dest => dest.pool_id, mapFrom(src => src.pool_id)),
        forMember(dest => dest.active, mapFrom(src => src.active)),
        forMember(dest => dest.active_epoch, mapDefer<Stake>(src => src.active_epoch ? fromValue(Number(src.active_epoch)) : ignore())),
        forMember(dest => dest.controlled_total_stake, mapFrom(src => Number(src.controlled_total_stake))),
        forMember(dest => dest.rewards_sum, mapFrom(src => Number(src.rewards_sum))),
        forMember(dest => dest.withdrawals_sum, mapFrom(src => Number(src.withdrawals_sum))),
        forMember(dest => dest.reserves_sum, mapFrom(src => Number(src.reserves_sum))),
        forMember(dest => dest.treasury_sum, mapFrom(src => Number(src.treasury_sum))),
        forMember(dest => dest.withdraw_available, mapFrom(src => Number(src.withdraw_available))),
      );
    }
  }
}