import { fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  CostModel, EpochParameters, Metadata } from '@tango-crypto/tango-ledger';
import { CostModelDto } from 'src/models/dto/CostModel.dto';
import { EpochParametersDto } from 'src/models/dto/EpochParameters.dto';

@Injectable()
export class EpochParametersProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<EpochParameters, EpochParametersDto>('EpochParameters', 'EpochParametersDto')
      .forMember(dest => dest.epoch_no, mapDefer<EpochParameters>(src => src.epoch_no ? fromValue(Number(src.epoch_no)) : ignore()))
      .forMember(dest => dest.min_fee_a, mapDefer<EpochParameters>(src => src.min_fee_a ? fromValue(Number(src.min_fee_a)) : ignore()))
      .forMember(dest => dest.min_fee_b, mapDefer<EpochParameters>(src => src.min_fee_b ? fromValue(Number(src.min_fee_b)) : ignore()))
      .forMember(dest => dest.max_block_size, mapDefer<EpochParameters>(src => src.max_block_size ? fromValue(Number(src.max_block_size)) : ignore()))
      .forMember(dest => dest.max_tx_size, mapDefer<EpochParameters>(src => src.max_tx_size ? fromValue(Number(src.max_tx_size)) : ignore()))
      .forMember(dest => dest.max_block_header_size, mapDefer<EpochParameters>(src => src.max_block_header_size ? fromValue(Number(src.max_block_header_size)) : ignore()))
      .forMember(dest => dest.key_deposit, mapDefer<EpochParameters>(src => src.key_deposit ? fromValue(Number(src.key_deposit)) : ignore()))
      .forMember(dest => dest.pool_deposit, mapDefer<EpochParameters>(src => src.pool_deposit ? fromValue(Number(src.pool_deposit)) : ignore()))
      .forMember(dest => dest.max_epoch, mapDefer<EpochParameters>(src => src.max_epoch ? fromValue(Number(src.max_epoch)) : ignore()))
      .forMember(dest => dest.optimal_pool_count, mapDefer<EpochParameters>(src => src.optimal_pool_count ? fromValue(Number(src.optimal_pool_count)) : ignore()))
      .forMember(dest => dest.influence_a0, mapDefer<EpochParameters>(src => src.influence_a0 ? fromValue(Number(src.influence_a0)) : ignore()))
      .forMember(dest => dest.monetary_expand_rate_rho, mapDefer<EpochParameters>(src => src.monetary_expand_rate_rho ? fromValue(Number(src.monetary_expand_rate_rho)) : ignore()))
      .forMember(dest => dest.treasury_growth_rate_tau, mapDefer<EpochParameters>(src => src.treasury_growth_rate_tau ? fromValue(Number(src.treasury_growth_rate_tau)) : ignore()))
      .forMember(dest => dest.decentralisation, mapDefer<EpochParameters>(src => src.decentralisation ? fromValue(Number(src.decentralisation)) : ignore()))
      .forMember(dest => dest.protocol_major, mapDefer<EpochParameters>(src => src.protocol_major ? fromValue(Number(src.protocol_major)) : ignore()))
      .forMember(dest => dest.protocol_minor, mapDefer<EpochParameters>(src => src.protocol_minor ? fromValue(Number(src.protocol_minor)) : ignore()))
      .forMember(dest => dest.min_utxo, mapDefer<EpochParameters>(src => src.min_utxo ? fromValue(Number(src.min_utxo)) : ignore()))
      .forMember(dest => dest.min_pool_cost, mapDefer<EpochParameters>(src => src.min_pool_cost ? fromValue(Number(src.min_pool_cost)) : ignore()))
      .forMember(dest => dest.nonce, mapFrom(src => src.nonce))
      .forMember(dest => dest.coins_per_utxo_size, mapDefer<EpochParameters>(src => src.coins_per_utxo_size ? fromValue(Number(src.coins_per_utxo_size)) : ignore()))
      .forMember(dest => dest.price_mem, mapDefer<EpochParameters>(src => src.price_mem ? fromValue(Number(src.price_mem)) : ignore()))
      .forMember(dest => dest.price_step, mapDefer<EpochParameters>(src => src.price_step ? fromValue(Number(src.price_step)) : ignore()))
      .forMember(dest => dest.max_tx_ex_mem, mapDefer<EpochParameters>(src => src.max_tx_ex_mem ? fromValue(Number(src.max_tx_ex_mem)) : ignore()))
      .forMember(dest => dest.max_tx_ex_steps, mapDefer<EpochParameters>(src => src.max_tx_ex_steps ? fromValue(Number(src.max_tx_ex_steps)) : ignore()))
      .forMember(dest => dest.max_block_ex_mem, mapDefer<EpochParameters>(src => src.max_block_ex_mem ? fromValue(Number(src.max_block_ex_mem)) : ignore()))
      .forMember(dest => dest.max_block_ex_steps, mapDefer<EpochParameters>(src => src.max_block_ex_steps ? fromValue(Number(src.max_block_ex_steps)) : ignore()))
      .forMember(dest => dest.max_val_size, mapDefer<EpochParameters>(src => src.max_val_size ? fromValue(Number(src.max_val_size)) : ignore()))
      .forMember(dest => dest.collateral_percent, mapDefer<EpochParameters>(src => src.collateral_percent ? fromValue(Number(src.collateral_percent)) : ignore()))
      .forMember(dest => dest.max_collateral_inputs, mapDefer<EpochParameters>(src => src.max_collateral_inputs ? fromValue(Number(src.max_collateral_inputs)) : ignore()))
      .forMember(dest => dest.cost_model, mapDefer<EpochParameters>(src => src.cost_model ? fromValue(mapper.map<CostModel, CostModelDto>(src.cost_model, 'CostModelDto', 'CostModel')) : ignore()))
      .forMember(dest => dest.block_id, ignore())
      ;

      mapper.createMap<CostModel, CostModelDto>('CostModel', 'CostModelDto')
      .forMember(dest => dest.hash, mapDefer<CostModel>(src => src.hash ? fromValue(src.hash) : ignore()))
      .forMember(dest => dest.costs, mapDefer<CostModel>(src => src.costs ? fromValue(src.costs) : ignore()))
      .forMember(dest => dest.block_id, ignore())
      ;
    }
  }
}