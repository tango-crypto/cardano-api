import { AutoMap } from "@automapper/classes";

export class RuleDto {
    @AutoMap()
    field: string;

    @AutoMap()
    operator: string;

    @AutoMap()
    value: string
}