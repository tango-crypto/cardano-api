import { AutoMap } from "@automapper/classes";
import { Rule } from "./rule.model";

export class Webhook {
    @AutoMap()
    user_id: string;

    @AutoMap()
    webhook_id: string; 

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

    auth_token: string;

    last_trigger_date: Date | string;

    @AutoMap({ type:() => Rule, depth: 0})
    rules?: Rule[];

    @AutoMap()
    create_date: Date | string;

    @AutoMap()
    update_date: Date | string;

    @AutoMap()
    type: string;

    @AutoMap()
    active: boolean;

    @AutoMap()
    confirmations: number;
}

export const webhookTypes = ['payment', 'epoch', 'block', 'delegation', 'transaction', 'asset', 'nft_api'];