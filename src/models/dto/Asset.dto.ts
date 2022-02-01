import { MetadataDto } from "./Metadata.dto";
import { createMetadataMap } from '@automapper/pojos';
import { Asset, Metadata } from "@tango-crypto/tango-ledger";

export interface AssetDto {
    quantity: number;
    policy_id: string;
    asset_name: string;
    mint_or_burn_count?: number;
    initial_mint_tx_hash?: string;
    on_chain_metadata?: any;
    fingerprint?: string;
    metadata?: MetadataDto;
}

// createMetadataMap<Asset>('Asset', {
//     quantity: Number,
//     policy_id: String,
//     asset_name: String,
//     mint_or_burn_count: Number,
//     initial_mint_tx_hash: String,
//     on_chain_metadata: Object,
//     fingerprint: String,
//     metadata: 'Metadata',
// });

// createMetadataMap<Metadata>('Metadata', {
//     label: String,
//     json: Object
// });

// createMetadataMap<AssetDto>('AssetDto', {
//     quantity: Number,
//     policy_id: String,
//     asset_name: String,
//     mint_or_burn_count: Number,
//     initial_mint_tx_hash: String,
//     on_chain_metadata: Object,
//     fingerprint: String,
//     metadata: 'MetadataDto',
// });

// createMetadataMap<MetadataDto>('MetadataDto', {
//     label: String,
//     json: Object
// });