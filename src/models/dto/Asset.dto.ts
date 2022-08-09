import { MetadataDto } from "./Metadata.dto";
export interface AssetDto {
    quantity: number;
    policy_id: string;
    asset_name: string;
    mint_quantity?: number;
	burn_quantity?: number;
	mint_or_burn_quantity?: number;
    initial_mint_tx_hash?: string;
    on_chain_metadata?: any;
    fingerprint?: string;
    metadata?: MetadataDto;
}