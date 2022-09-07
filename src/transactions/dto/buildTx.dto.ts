import { Asset } from "src/utils/models/asset.model";
import { CoinSelectionInput } from "src/utils/models/coin-selection-input.model";
import { CoinSelectionInputDto } from "src/utils/models/dto/api.coin-selection-input.dto";
import { JsonScript } from "src/utils/models/json-script.model";
import { Payment } from "src/utils/models/payment.model";

export interface BuildTxDto {
    inputs: CoinSelectionInputDto[];
    outputs?: Payment[];
    burnouts?: { scripts?: any[], keys?: string[], assets?: Asset[]};
    recipients?: { [key: string]: {  policy_id: string,  asset_name: string, quantity: number, metadata?: any}[] };
    minting_keys?: string[];
    minting_script?: JsonScript;
    change_address?: string;
}