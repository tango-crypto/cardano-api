export interface EvaluateTxDto {
    tx: string;
    utxos?: UtxoDto[];
}

export interface Asset {
    quantity: number;
    policy_id: string;
    asset_name: string;
}

export interface Datum {
    hash: string;
    value?: any;
    value_raw?: string;
}

export interface Redeemer {
    unit_mem: number;
    unit_steps: number;
    fee?: number;
    purpose: string;
    index: number;
    script_hash?: string;
    data?: Datum;
}

export interface Script {
    type: string;
    hash: string;
    json?: any;
    code?: string;
    serialised_size?: number;
    datum?: Datum;
    redeemer?: Redeemer;
}


export interface TxInDto {
    hash: string;
    index: number;
}

export interface TxOutDto {
    address: string;
    value: number;
    assets?: Asset[];
    datum?: Datum;
    script?: Script;
}

export declare type UtxoDto = [TxInDto, TxOutDto];