import { AutoMap } from "@automapper/classes";

export class Rule {
    @AutoMap()
    field: string;

    @AutoMap()
    operator: string;

    @AutoMap()
    value: string
}