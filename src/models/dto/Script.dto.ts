import { DatumDto } from "./Datum.dto";
import { RedeemerDto } from "./Redeemer.dto";

export interface ScriptDto {
    type: string;
    hash: string;
    json?: any;
    code?: string;
    serialised_size?: number;
    datum?: DatumDto;
    redeemer?: RedeemerDto;
}