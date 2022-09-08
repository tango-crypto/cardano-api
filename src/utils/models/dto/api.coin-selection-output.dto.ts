import { Asset } from "../asset.model";

export interface CoinSelectionOutputDto {
  address: string;
  value: number;
  assets?: Asset[];
}
