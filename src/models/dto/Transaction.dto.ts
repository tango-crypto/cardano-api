import { AssetDto } from "./Asset.dto";
import { BlockDto } from "./Block.dto";
import { UtxoDto } from "./Utxo.dto";

export interface TransactionDto {
    id: number;
    hash: string;
    block_id: number;
    block_index: number;
    out_sum: number;
    fee: number;
    deposit: number;
    size: number;
    invalid_before?: number;
    invalid_hereafter?: number;
    valid_contract: boolean;
    script_size: number;
    utxo_count?: number;
    withdrawal_count?: number;
    delegation_count?: number;
    stake_cert_count?: number;
    pool_update?: boolean;
    pool_retire?: boolean;
    asset_mint_or_burn_count?: number;
    block_hash?: string;
    block_epoch_no?: number;
    block_block_no?: number;
    block_slot_no?: number;
    block?: BlockDto;
    asset_quantity?: number;
    asset_policy_id?: string;
    asset_name?: string;
    assets?: AssetDto[];
    inputs?: UtxoDto[];
    outputs?: UtxoDto[];
}