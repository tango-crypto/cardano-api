import { AutoMap } from "@automapper/classes";
import { Rule } from "./rule.model";

export class Webhook {
    PK?: string;
    SK?: string;
    webhook_id: string; 
    account_id: string;

    @AutoMap()
    webhook_key: string; 

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

    @AutoMap({ typeFn: () => Rule})
    rules: Rule[];

    @AutoMap()
    create_date: Date | string;

    @AutoMap()
    update_date: Date | string;

    @AutoMap()
    type: string;

    @AutoMap()
    available: string;
}

export const webhookTypes = ['payment', 'epoch', 'block', 'delegation', 'transaction', 'nft'];