import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class CreateWebhookDto {
    @AutoMap()
    webhook_key: string;

    @AutoMap()
    auth_token: string;

    @AutoMap()
    name: string;

    @AutoMap()
    description: string;

    @AutoMap()
    type: string;

    @AutoMap()
    callback_url: string;

    last_trigger_date: string | number | Date;

    @AutoMap({ typeFn: () => RuleDto})
    rules: RuleDto[];

    @AutoMap()
    create_date: Date | string;

    @AutoMap()
    update_date: Date | string;

    @AutoMap()
    available: string;
}
