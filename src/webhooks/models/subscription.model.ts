import { AutoMap } from "@automapper/classes";

export class Subscription {
    @AutoMap()
    user_id?: string;

    @AutoMap()
    user_first_name?: string;

    @AutoMap()
    user_last_name?: string;

    @AutoMap()
    user_email?: string;

    @AutoMap()
    user_password?: string;

    @AutoMap()
    user_start_time?: string;

    @AutoMap()
    user_end_time?: string;

    @AutoMap()
    user_active?: boolean;

    @AutoMap()
    api_key_hash: string;

    @AutoMap()
    tier: string;

    @AutoMap()
    currency: string;

    @AutoMap()
    price: number;

    @AutoMap()
    applications_count: number;

    @AutoMap()
    webhooks_count: number;

    @AutoMap()
    webhooks_active: boolean;

    @AutoMap()
    webhooks_auth_token: string;

    @AutoMap()
    start_time: string;

    @AutoMap()
    end_time: string;

    @AutoMap()
    active: boolean;
}