export interface EpochParametersDto {
    epoch_no?: number;
    min_fee_a?: number;
    min_fee_b?: number;
    max_block_size?: number;
    max_tx_size?: number;
    max_block_header_size?: number;
    key_deposit?: number;
    pool_deposit?: number;
    max_epoch?: number;
    optimal_pool_count?: number;
    influence_a0?: number;
    monetary_expand_rate_rho?: number;
    treasury_growth_rate_tau?: number;
    decentralisation?: number;
    entropy?: string;
    protocol_major?: number;
    protocol_minor?: number;
    min_utxo?: number;
    min_pool_cost?: number;
    nonce: string;
    block_id?: number;
}