import { AssetDto } from "./Asset.dto";
import { UtxoDto } from "./Utxo.dto";

export interface AddressDetailDto {
	network : string;
	address: string;
	stake_address: string;
	balance?: number;
	transactions_count?: number;
	assets?: AssetDto[];
	utxos?: UtxoDto[];
}
