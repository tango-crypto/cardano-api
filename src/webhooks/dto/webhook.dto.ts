import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class WebhookDto {
    id: string;

    type: string;

    address?: string;

    @AutoMap()
    name: string;
    
    @AutoMap()
    network: string;

    @AutoMap()
    description: string;

    @AutoMap()
    callback_url: string;

    @AutoMap({ type:() => RuleDto})
    rules: RuleDto[];

    @AutoMap()
    create_date: Date | string;

    @AutoMap()
    update_date: Date | string;

    @AutoMap()
    available: string;

    @AutoMap()
    confirmations?: number;
}