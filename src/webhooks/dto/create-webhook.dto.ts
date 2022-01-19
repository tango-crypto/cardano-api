import { AutoMap } from "@automapper/classes";
import { IsWebhookPaymentAddress } from "../validators/webhook-address.validator";
import { IsWebhookType } from "../validators/webhook-type.validator";
import { RuleDto } from "./rule.dto";

export class CreateWebhookDto {
    @IsWebhookPaymentAddress({message: 'Invalid address for payment webhook'})
    address?: string;

    @AutoMap()
    network: string;
    
    @IsWebhookType({message: 'Invalid webhook type'})
    type: string;

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
