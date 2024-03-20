import { AutoMap } from "@automapper/classes";

export class Application {
    @AutoMap()
    user_id: string;

    @AutoMap()
    api_id: string;

    @AutoMap()
    name: string;

    @AutoMap()
    network: string;

    @AutoMap()
    description: string;

    @AutoMap()
    base_url: string;

    @AutoMap()
    create_time: string;

    @AutoMap()
    update_time: string;

    @AutoMap()
    active: string;
}