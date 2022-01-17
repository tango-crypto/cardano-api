import { AutoMap } from "@automapper/classes";
import { RuleDto } from "./rule.dto";

export class CreateWebhookDto {
    address?: string;

    @AutoMap()
    network: string;
    
    type: string;

    @AutoMap()
    auth_token: string;

    @AutoMap()
    name: string;

    @AutoMap()
    description: string;

    @AutoMap()
    callback_url: string;

    @AutoMap({ typeFn: () => RuleDto})
    rules: RuleDto[];

    @AutoMap()
    available: string;
}
