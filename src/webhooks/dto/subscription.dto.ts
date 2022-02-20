import { AutoMap } from "@automapper/classes";

export class SubscriptionDto {
    @AutoMap()
    available: string;
    @AutoMap()
    currency: string;
    @AutoMap()
    webhooks_active: string;
    @AutoMap()
    webhook_auth_token: string;
    @AutoMap()
    end_date: string;
    @AutoMap()
    tier: string;
    @AutoMap()
    api_key: string;
    @AutoMap()
    api_key_hash: string;
    @AutoMap()
    applications_count: number;
    @AutoMap()
    webhooks_count: number;
    @AutoMap()
    name: string;
    @AutoMap()
    start_date: string;
    @AutoMap()
    price: number;
    @AutoMap()
    id: string;
    @AutoMap()
    type: string;
}