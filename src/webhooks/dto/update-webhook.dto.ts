import { Type } from "class-transformer";
import { IsDefined, IsUrl, ValidateIf, ValidateNested } from "class-validator";
import { IsWebhookPaymentAddress, IsWebhookType } from "../validators/webhook.validator";
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

    @ValidateIf(o => o.callback_url)
    @IsUrl()
    callback_url?: string;

    @ValidateIf(r => r.rules && r.rules.length > 0)
    @ValidateNested({each: true})
    @Type(() => RuleDto)
    rules?: RuleDto[];
    
    available?: string | boolean;
    confirmations?: number;
}
