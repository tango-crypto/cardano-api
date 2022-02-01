import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Block } from '@tango-crypto/tango-ledger';
import { BlockDto } from 'src/models/dto/Block.dto';

@Injectable()
export class BlockProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Block, BlockDto>('Block', 'BlockDto')
      .forMember(dest => dest.id, mapFrom(src => src.id))
      .forMember(dest => dest.hash, mapFrom(src => src.hash))
      .forMember(dest => dest.epoch_no, mapFrom(src => src.epoch_no))
      .forMember(dest => dest.slot_no, mapFrom(src => src.slot_no))
      .forMember(dest => dest.epoch_slot_no, mapFrom(src => src.epoch_slot_no))
      .forMember(dest => dest.block_no, mapFrom(src => src.block_no))
      .forMember(dest => dest.previous_block, mapFrom(src => src.previous_block))
      .forMember(dest => dest.next_block, mapFrom(src => src.next_block))
      .forMember(dest => dest.merkle_root, mapFrom(src => src.merkle_root))
      .forMember(dest => dest.slot_leader_id, ignore())
      .forMember(dest => dest.slot_leader, mapFrom(src => src.slot_leader))
      .forMember(dest => dest.out_sum, mapFrom(src => src.out_sum))
      .forMember(dest => dest.fees, mapFrom(src => src.fees))
      .forMember(dest => dest.confirmations, mapFrom(src => src.confirmations))
      .forMember(dest => dest.size, mapFrom(src => src.size))
      .forMember(dest => dest.time, mapFrom(src => src.time))
      .forMember(dest => dest.tx_count, mapFrom(src => src.tx_count))
      .forMember(dest => dest.proto_major, mapFrom(src => src.proto_major))
      .forMember(dest => dest.proto_minor, mapFrom(src => src.proto_minor))
      .forMember(dest => dest.vrf_key, mapFrom(src => src.vrf_key))
      .forMember(dest => dest.op_cert, mapFrom(src => src.op_cert))
      .forMember(dest => dest.pool, mapFrom(src => src.pool))
      ;
    }
  }
}