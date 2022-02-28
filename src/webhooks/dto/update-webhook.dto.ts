import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsUrl, ValidateIf, ValidateNested } from "class-validator";
import { IsWebhookPaymentAddress, IsWebhookType } from "../validators/webhook.validator";
import { RuleDto } from "./rule.dto";

export class UpdateWebhookDto {
    @ValidateIf(w => w.address)
    @IsWebhookPaymentAddress({message: 'Invalid address'})
    address?: string;

    @ValidateIf(w => w.type)
    @IsWebhookType({message: 'Invalid webhook type'})
    type?: string;

    name?: string;

    @ValidateIf(w => w.network)
    @IsIn(['mainnet', 'testnet'])
    network?: string;

    description?: string;

    @ValidateIf(w => w.callback_url)
    @IsUrl()
    callback_url?: string;

    @ValidateIf(r => r.rules && r.rules.length > 0)
    @ValidateNested({each: true})
    @Type(() => RuleDto)
    rules?: RuleDto[];
    
    available?: string | boolean;
    confirmations?: number;
}
