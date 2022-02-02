import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Epoch } from '@tango-crypto/tango-ledger';
import { EpochDto } from 'src/models/dto/Epoch.dto';

@Injectable()
export class EpochProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Epoch, EpochDto>('Epoch', 'EpochDto')
      .forMember(dest => dest.id, ignore())
      .forMember(dest => dest.out_sum, mapFrom(src => src.out_sum))
      .forMember(dest => dest.fees, mapFrom(src => src.fees))
      .forMember(dest => dest.tx_count, mapFrom(src => src.tx_count))
      .forMember(dest => dest.blk_count, mapFrom(src => src.blk_count))
      .forMember(dest => dest.no, mapFrom(src => src.no))
      .forMember(dest => dest.start_time, mapFrom(src => src.start_time))
      .forMember(dest => dest.end_time, mapFrom(src => src.end_time))
      ;
    }
  }
}