import { AutoMap } from "@automapper/classes";
import { ApplicationDto } from "./application.dto";
import { SubscriptionDto } from "./subscription.dto";
import { WebhookDto } from "./webhook.dto";

export class AccountDto {
    @AutoMap()
    id: string;
    @AutoMap()
    subscription: SubscriptionDto;
    @AutoMap({ type:() => ApplicationDto})
    applications: ApplicationDto[];
    @AutoMap({ type:() => WebhookDto})
    webhooks: WebhookDto[];
}