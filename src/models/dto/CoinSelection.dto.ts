import { ValueDto } from "./Value.dto";

export interface CoinSelectionDto {
    value: ValueDto;
    max_input_count?: number;
    check_min_utxo: boolean;
}