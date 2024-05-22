import { UtxoDto } from "src/models/dto/Utxo.dto";

export interface EvaluateTxDto {
    tx: string;
    utxos?: UtxoDto[];
}

export interface Asset {
    policy_id: string;
    asset_name: string;
    quantity: number;
}

export interface Datum {
    hash: string;
    value?: any;
    value_raw?: string;
}

export interface Redeemer {
    unit_mem: number;
    unit_cpu: number;
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

export declare type OgmiosUtxoDto = [TxInDto, TxOutDto];