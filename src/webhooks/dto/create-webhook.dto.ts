import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class CreateWebhookDto {
    @AutoMap()
    name: string;

    @AutoMap()
    description: string;

    @AutoMap()
    webhook_type: string;

    @AutoMap()
    callback_url: string;

    @AutoMap()
    auth_token: string;

    last_trigger_date: string | number | Date;

    @AutoMap({ typeFn: () => RuleDto})
    rules: RuleDto[];

    available: string | boolean;
}
