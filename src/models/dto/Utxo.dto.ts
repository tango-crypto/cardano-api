import { AssetDto } from "./Asset.dto";
import { DatumDto } from "./Datum.dto";
import { ScriptDto } from "./Script.dto";

export interface UtxoDto {
    tx_id?: number;
    address: string;
    hash?: string;
    index?: number;
    value?: number;
    has_script?: boolean;
    quantity?: number;
    policy_id?: string;
    asset_name?: string;
    fingerprint?: string;
    assets?: AssetDto[];
    inline_datum?: DatumDto;
	reference_script?: ScriptDto;
    script?: ScriptDto;
}