import { AutoMap } from "@automapper/classes";
import { Application } from "./application.model";
import { Subscription } from "./subscription.model";
import { Webhook } from "./webhook.model";

export class Account {
    @AutoMap()
    id: string;
    @AutoMap()
    subscription: Subscription;
    @AutoMap({ typeFn: () => Application})
    applications: Application[];
    @AutoMap({ typeFn: () => Webhook})
    webhooks: Webhook[];
}