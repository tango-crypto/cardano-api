import { DatumDto } from "./Datum.dto";

export interface RedeemerDto {
    hash: string;
    index: number;
    unit_mem: number;
    unit_steps: number;
    fee?: number;
    purpose: string;
    script_hash?: string;
    data: DatumDto;
}