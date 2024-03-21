import { createMap, forMember, ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Epoch } from '@tango-crypto/tango-ledger';
import { EpochDto } from 'src/models/dto/Epoch.dto';

@Injectable()
export class EpochProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Epoch, EpochDto>(mapper, 'Epoch', 'EpochDto',
        forMember(dest => dest.id, ignore()),
        forMember(dest => dest.out_sum, mapFrom(src => Number(src.out_sum))),
        forMember(dest => dest.fees, mapFrom(src => Number(src.fees))),
        forMember(dest => dest.tx_count, mapFrom(src => Number(src.tx_count))),
        forMember(dest => dest.blk_count, mapFrom(src => Number(src.blk_count))),
        forMember(dest => dest.no, mapFrom(src => Number(src.no))),
        forMember(dest => dest.start_time, mapFrom(src => src.start_time)),
        forMember(dest => dest.end_time, mapFrom(src => src.end_time)),
      );
    }
  }
}