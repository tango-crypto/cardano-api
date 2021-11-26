import { Asset } from "@tango-crypto/tango-ledger";

export interface AddressDetail {
	network : string;
	address: string;
	stake_address: string
	ada: number
	assets: Asset[];
}
