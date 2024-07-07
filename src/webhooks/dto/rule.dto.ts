import { AutoMap } from "@automapper/classes";
import { IsValidField, IsValidOperator, IsValidValue } from "../validators/rules.validator";
import { operatorType } from "../models/rule.model";

export class RuleDto {
    @AutoMap()
    @IsValidField({message: 'invalid field'})
    field: string;

    @AutoMap()
    @IsValidOperator({message: 'invalid operator'})
    operator: string;

    @AutoMap()
    @IsValidValue({message: 'invalid value'})
    value: string | number | boolean;
}