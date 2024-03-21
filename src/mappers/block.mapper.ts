import { fromValue, createMap, ignore, mapDefer, mapFrom, forMember } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { Block, Pool } from '@tango-crypto/tango-ledger';
import { BlockDto } from 'src/models/dto/Block.dto';
import { PoolDto } from 'src/models/dto/Pool.dto';

@Injectable()
export class BlockProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Block, BlockDto>(mapper, 'Block', 'BlockDto',
        forMember(dest => dest.id, ignore()),
        forMember(dest => dest.hash, mapFrom(src => src.hash)),
        forMember(dest => dest.epoch_no, mapFrom(src => Number(src.epoch_no))),
        forMember(dest => dest.slot_no, mapFrom(src => Number(src.slot_no))),
        forMember(dest => dest.epoch_slot_no, mapDefer<Block>(src => src.epoch_slot_no ? fromValue(Number(src.epoch_slot_no)) : ignore())),
        forMember(dest => dest.block_no, mapFrom(src => Number(src.block_no))),
        forMember(dest => dest.previous_block, mapDefer<Block>(src => src.previous_block ? fromValue(Number(src.previous_block)) : ignore())),
        forMember(dest => dest.next_block, mapDefer<Block>(src => src.next_block ? fromValue(Number(src.next_block)) : ignore())),
        forMember(dest => dest.merkle_root, mapDefer<Block>(src => src.merkle_root ? fromValue(Number(src.merkle_root)) : ignore())),
        forMember(dest => dest.slot_leader_id, ignore()),
        forMember(dest => dest.slot_leader, mapFrom(src => src.slot_leader)),
        forMember(dest => dest.out_sum, mapDefer<Block>(src => src.out_sum ? fromValue(Number(src.out_sum)) : ignore())),
        forMember(dest => dest.fees, mapDefer<Block>(src => src.fees ? fromValue(Number(src.fees)) : ignore())),
        forMember(dest => dest.confirmations, mapDefer<Block>(src => src.confirmations ? fromValue(Number(src.confirmations)) : ignore())),
        forMember(dest => dest.size, mapDefer<Block>(src => src.size ? fromValue(Number(src.size)) : ignore())),
        forMember(dest => dest.time, mapFrom(src => src.time)),
        forMember(dest => dest.tx_count, mapDefer<Block>(src => src.tx_count ? fromValue(Number(src.tx_count)) : ignore())),
        forMember(dest => dest.proto_major, mapDefer<Block>(src => src.proto_major ? fromValue(Number(src.proto_major)) : ignore())),
        forMember(dest => dest.proto_minor, mapDefer<Block>(src => src.proto_minor ? fromValue(Number(src.proto_minor)) : ignore())),
        forMember(dest => dest.vrf_key, mapFrom(src => src.vrf_key)),
        forMember(dest => dest.op_cert, mapFrom(src => src.op_cert)),
        forMember(dest => dest.pool, mapDefer<Block>(src => src.pool ? fromValue(mapper.map<Pool, PoolDto>(src.pool, 'Pool', 'PoolDto')) : ignore())),
      );
    }
  }
}