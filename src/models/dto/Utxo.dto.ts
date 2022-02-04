import { AssetDto } from "./Asset.dto";

export interface UtxoDto {
    tx_id?: number;
    address: string;
    hash?: string;
    index?: number;
    value?: number;
    smart_contract?: boolean;
    quantity?: number;
    policy_id?: string;
    asset_name?: string;
    fingerprint?: string;
    assets?: AssetDto[];
}