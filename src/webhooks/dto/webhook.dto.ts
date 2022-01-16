import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class WebhookDto {
    id: string;

    @AutoMap()
    webhook_key: string; 

    account_id: string;

    @AutoMap()
    name: string;
    
    @AutoMap()
    network: string;

    @AutoMap()
    description: string;

    @AutoMap()
    callback_url: string;

    @AutoMap()
    auth_token: string;

    last_trigger_date: Date | string;

    @AutoMap({ typeFn: () => RuleDto})
    rules: RuleDto[];

    @AutoMap()
    create_date: Date | string;

    @AutoMap()
    update_date: Date | string;

    @AutoMap()
    type: string;

    @AutoMap()
    available: string;
}