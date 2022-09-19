import { DatumDto } from "./Datum.dto";

export interface RedeemerDto {
    unit_mem: number;
    unit_steps: number;
    fee?: number;
    purpose: string;
    index: number;
    script_hash?: string;
    data: DatumDto;
}