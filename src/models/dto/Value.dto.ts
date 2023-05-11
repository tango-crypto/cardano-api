import { AssetDto } from "./Asset.dto";

export interface ValueDto {
    lovelace: number;
    assets?: AssetDto[]
}