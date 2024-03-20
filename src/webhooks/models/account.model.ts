import { AutoMap } from "@automapper/classes";
import { Application } from "./application.model";
import { Subscription } from "./subscription.model";
import { Webhook } from "./webhook.model";

export class Account {
    @AutoMap()
    id: string;

    @AutoMap()
    first_name: string;

    @AutoMap()
    last_name: string;

    @AutoMap()
    email: string;

    @AutoMap()
    password: string;
    
    @AutoMap()
    subscription?: Subscription;
    
    @AutoMap({ typeFn: () => Application})
    applications?: Application[];
    
    @AutoMap({ typeFn: () => Webhook})
    webhooks?: Webhook[];
    
    @AutoMap()
    start_time: string;

    @AutoMap()
    end_time: string;

    @AutoMap()
    active: boolean;

}