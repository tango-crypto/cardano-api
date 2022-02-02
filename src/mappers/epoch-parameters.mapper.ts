import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  EpochParameters, Metadata } from '@tango-crypto/tango-ledger';
import { EpochParametersDto } from 'src/models/dto/EpochParameters.dto';

@Injectable()
export class EpochParametersProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<EpochParameters, EpochParametersDto>('EpochParameters', 'EpochParametersDto')
      .forMember(dest => dest.epoch_no, mapFrom(src => src.epoch_no))
      .forMember(dest => dest.min_fee_a, mapFrom(src => src.min_fee_a))
      .forMember(dest => dest.min_fee_b, mapFrom(src => src.min_fee_b))
      .forMember(dest => dest.max_block_size, mapFrom(src => src.max_block_size))
      .forMember(dest => dest.max_tx_size, mapFrom(src => src.max_tx_size))
      .forMember(dest => dest.max_block_header_size, mapFrom(src => src.max_block_header_size))
      .forMember(dest => dest.key_deposit, mapFrom(src => src.key_deposit))
      .forMember(dest => dest.pool_deposit, mapFrom(src => src.pool_deposit))
      .forMember(dest => dest.max_epoch, mapFrom(src => src.max_epoch))
      .forMember(dest => dest.optimal_pool_count, mapFrom(src => src.optimal_pool_count))
      .forMember(dest => dest.influence_a0, mapFrom(src => src.influence_a0))
      .forMember(dest => dest.monetary_expand_rate_rho, mapFrom(src => src.monetary_expand_rate_rho))
      .forMember(dest => dest.treasury_growth_rate_tau, mapFrom(src => src.treasury_growth_rate_tau))
      .forMember(dest => dest.decentralisation, mapFrom(src => src.decentralisation))
      .forMember(dest => dest.entropy, mapFrom(src => src.entropy))
      .forMember(dest => dest.protocol_major, mapFrom(src => src.protocol_major))
      .forMember(dest => dest.protocol_minor, mapFrom(src => src.protocol_minor))
      .forMember(dest => dest.min_utxo, mapFrom(src => src.min_utxo))
      .forMember(dest => dest.min_pool_cost, mapFrom(src => src.min_pool_cost))
      .forMember(dest => dest.nonce, mapFrom(src => src.nonce))
      .forMember(dest => dest.block_id, ignore())
      ;
    }
  }
}