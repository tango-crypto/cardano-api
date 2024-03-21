import { createMap, forMember, fromValue, ignore, mapDefer, mapFrom } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import {  Asset, Block, Transaction, Utxo } from '@tango-crypto/tango-ledger';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { BlockDto } from 'src/models/dto/Block.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';

@Injectable()
export class TransactionProfile extends AutomapperProfile {
  constructor(@InjectMapper('pojo-mapper') mapper: Mapper) {
    super(mapper);
  }

  get profile() {
    return (mapper: Mapper) => {
      createMap<Transaction, TransactionDto>(mapper, 'Transaction', 'TransactionDto',
      forMember(dest => dest.id, ignore()),
      forMember(dest => dest.hash, mapFrom(src => src.hash)),
      forMember(dest => dest.block_id, ignore()),
      forMember(dest => dest.block_index, mapFrom(src => Number(src.block_index))),
      forMember(dest => dest.out_sum, mapFrom(src => Number(src.out_sum))),
      forMember(dest => dest.fee, mapFrom(src => Number(src.fee))),
      forMember(dest => dest.deposit, mapFrom(src => Number(src.deposit))) ,
      forMember(dest => dest.size, mapFrom(src => Number(src.size))),
      forMember(dest => dest.invalid_before, mapDefer<Transaction>(src => src.invalid_before ? fromValue(Number(src.invalid_before)) : ignore())),
      forMember(dest => dest.invalid_hereafter, mapDefer<Transaction>(src => src.invalid_hereafter ? fromValue(Number(src.invalid_hereafter)) : ignore())),
      forMember(dest => dest.valid_contract, mapFrom(src => src.valid_contract)),
      forMember(dest => dest.script_size, mapFrom(src => Number(src.script_size))),
      forMember(dest => dest.utxo_count, mapDefer<Transaction>(src => src.utxo_count ? fromValue(Number(src.utxo_count)) : ignore())),
      forMember(dest => dest.withdrawal_count, mapDefer<Transaction>(src => src.withdrawal_count ? fromValue(Number(src.withdrawal_count)) : ignore())),
      forMember(dest => dest.delegation_count, mapDefer<Transaction>(src => src.delegation_count ? fromValue(Number(src.delegation_count)) : ignore())),
      forMember(dest => dest.stake_cert_count, mapDefer<Transaction>(src => src.stake_cert_count ? fromValue(Number(src.stake_cert_count)) : ignore())),
      forMember(dest => dest.pool_update, mapFrom(src => src.pool_update)),
      forMember(dest => dest.pool_retire, mapFrom(src => src.pool_retire)),
      forMember(dest => dest.block_hash, ignore()),
      forMember(dest => dest.block_epoch_no, ignore()),
      forMember(dest => dest.block_block_no, ignore()),
      forMember(dest => dest.block_slot_no, ignore()),
      forMember(dest => dest.block, mapDefer<Transaction>(src => src.block ? fromValue(mapper.map<Block, BlockDto>(src.block, 'Block', 'BlockDto')) : ignore())),
      forMember(dest => dest.asset_quantity, ignore()),
      forMember(dest => dest.asset_policy_id, ignore()),
      forMember(dest => dest.asset_name, ignore()),
      forMember(dest => dest.assets, mapDefer<Transaction>(src => src.assets ? fromValue(mapper.mapArray<Asset, AssetDto>(src.assets, 'Asset', 'AssetDto')) : ignore())),
      forMember(dest => dest.inputs, mapDefer<Transaction>(src => src.inputs ? fromValue(src.inputs.length == 0 ? [] : typeof src.inputs[0] == 'string' ? src.inputs : mapper.mapArray<Utxo, UtxoDto>(src.inputs as Utxo[], 'Utxo', 'UtxoDto')): ignore())),
      forMember(dest => dest.outputs, mapDefer<Transaction>(src => src.outputs ? fromValue(src.outputs.length == 0 ? [] : typeof src.outputs[0] == 'string' ? src.outputs : mapper.mapArray<Utxo, UtxoDto>(src.outputs as Utxo[], 'Utxo', 'UtxoDto')): ignore())),
      );
    }
  }
}