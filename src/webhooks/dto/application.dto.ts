import { AutoMap } from "@automapper/classes";

export class ApplicationDto {
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
    create_date: string;
    @AutoMap()
    update_date: string;
    @AutoMap()
    type: string;
    @AutoMap()
    available: string;
}