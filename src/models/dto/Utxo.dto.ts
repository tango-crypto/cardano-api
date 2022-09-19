import { AssetDto } from "./Asset.dto";
import { ScriptDto } from "./Script.dto";

export interface UtxoDto {
    tx_id?: number;
    address: string;
    hash?: string;
    index?: number;
    value?: number;
    smart_contract?: boolean;
    has_script?: boolean;
    quantity?: number;
    policy_id?: string;
    asset_name?: string;
    fingerprint?: string;
    assets?: AssetDto[];
    script?: ScriptDto;
}