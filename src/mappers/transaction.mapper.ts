import { ignore, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import {  Transaction } from '@tango-crypto/tango-ledger';
import { TransactionDto } from 'src/models/dto/Transaction.dto';

@Injectable()
export class TransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  mapProfile() {
    return (mapper: Mapper) => {
      mapper.createMap<Transaction, TransactionDto>('Transaction', 'TransactionDto')
      .forMember(dest => dest.id, mapFrom(src => src.id))
      .forMember(dest => dest.hash, mapFrom(src => src.hash))
      .forMember(dest => dest.block_id, ignore())
      .forMember(dest => dest.block_index, mapFrom(src => src.block_index))
      .forMember(dest => dest.out_sum, mapFrom(src => src.out_sum))
      .forMember(dest => dest.fee, mapFrom(src => src.fee))
      .forMember(dest => dest.deposit, mapFrom(src => src.deposit))
      .forMember(dest => dest.size, mapFrom(src => src.size))
      .forMember(dest => dest.invalid_before, mapFrom(src => src.invalid_before))
      .forMember(dest => dest.invalid_hereafter, mapFrom(src => src.invalid_hereafter))
      .forMember(dest => dest.valid_contract, mapFrom(src => src.valid_contract))
      .forMember(dest => dest.script_size, mapFrom(src => src.script_size))
      .forMember(dest => dest.utxo_count, mapFrom(src => src.utxo_count))
      .forMember(dest => dest.withdrawal_count, mapFrom(src => src.withdrawal_count))
      .forMember(dest => dest.delegation_count, mapFrom(src => src.delegation_count))
      .forMember(dest => dest.stake_cert_count, mapFrom(src => src.stake_cert_count))
      .forMember(dest => dest.pool_update, mapFrom(src => src.pool_update))
      .forMember(dest => dest.pool_retire, mapFrom(src => src.pool_retire))
      .forMember(dest => dest.asset_mint_or_burn_count, mapFrom(src => src.asset_mint_or_burn_count))
      .forMember(dest => dest.block_hash, ignore())
      .forMember(dest => dest.block_epoch_no, ignore())
      .forMember(dest => dest.block_block_no, ignore())
      .forMember(dest => dest.block_slot_no, ignore())
      .forMember(dest => dest.block, mapFrom(src => src.block))
      .forMember(dest => dest.asset_quantity, ignore())
      .forMember(dest => dest.asset_policy_id, ignore())
      .forMember(dest => dest.asset_name, ignore())
      .forMember(dest => dest.assets, mapFrom(src => src.assets))
      .forMember(dest => dest.inputs, mapFrom(src => src.inputs))
      .forMember(dest => dest.outputs, mapFrom(src => src.outputs))
      ;
    }
  }
}