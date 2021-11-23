import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class WebhookDto {
    
    id: string;

    userId: string;

    @AutoMap()
    name: string;
    
    @AutoMap()
    network: string;

    @AutoMap()
    description: string;

    @AutoMap()
    webhook_type: string;

    @AutoMap()
    callback_url: string;

    last_trigger_date: string | number | Date;

    @AutoMap({ typeFn: () => RuleDto})
    rules: RuleDto[];

    type: string;

    available: string;
}