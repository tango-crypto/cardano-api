import { AutoMap } from "@automapper/classes";
import { Rule } from "./rule.model";

export class Webhook {
    @AutoMap()
    name: string;

    network: string;

    @AutoMap()
    description: string;

    @AutoMap()
    webhook_type: string;

    @AutoMap()
    callback_url: string;

    @AutoMap()
    auth_token: string;

    last_trigger_date: string;

    @AutoMap({ typeFn: () => Rule})
    rules: Rule[];

    create_date: string | number | Date;

    update_date: string | number | Date;

    type: string;

    available: string;

    SK: string;

    PK: string
}