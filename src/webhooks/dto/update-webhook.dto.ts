import { ValidateIf } from "class-validator";
import { IsWebhookPaymentAddress } from "../validators/webhook-address.validator";
import { IsWebhookType } from "../validators/webhook-type.validator";
import { RuleDto } from "./rule.dto";

export class UpdateWebhookDto {
    @ValidateIf(o => o.type)
    @IsWebhookPaymentAddress({message: 'Invalid address for payment webhook'})
    address?: string;

    @ValidateIf(o => o.type)
    @IsWebhookType({message: 'Invalid webhook type'})
    type?: string;

    name?: string;
    network?: string;
    description?: string;
    callback_url?: string;
    rules?: RuleDto[];
    available?: string | boolean;
    confirmations?: number;
}
