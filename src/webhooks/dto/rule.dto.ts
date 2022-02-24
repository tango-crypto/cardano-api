import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";
import { IsValidField, IsValidOperator, IsValidValue } from "../validators/rules.validator";

export class RuleDto {
    @AutoMap()
    @IsValidField({message: 'invalid field'})
    field: string;

    @AutoMap()
    @IsValidOperator({message: 'invalid operator'})
    operator: string;

    @AutoMap()
    @IsValidValue({message: 'invalid value'})
    value: string
}