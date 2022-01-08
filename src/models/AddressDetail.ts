import { Asset, Utxo } from "@tango-crypto/tango-ledger";

export interface AddressDetail {
	network : string;
	address: string;
	stake_address: string;
	balance?: number;
	transactions_count?: number;
	assets?: Asset[];
	utxos?: Utxo[];
}
