import { Type } from "class-transformer";
import { AutoMap } from "@automapper/classes";
import { ValidateIf, IsIn, IsNotEmpty, IsUrl, ValidateNested } from 'class-validator';
import { IsWebhookPaymentAddress, IsWebhookType } from "../validators/webhook.validator";
import { RuleDto } from "./rule.dto";

export class CreateWebhookDto {
    @IsWebhookPaymentAddress({message: 'Invalid address for payment webhook'})
    address?: string;

    @AutoMap()
    @IsIn(['mainnet', 'testnet'])
    network: string;
    
    @IsWebhookType({message: 'Invalid webhook type'})
    type: string;

    @AutoMap()
    @IsNotEmpty()
    name: string;

    @AutoMap()
    description: string;

    @AutoMap()
    @IsUrl()
    callback_url: string;

    @AutoMap({ typeFn: () => RuleDto})
    @ValidateIf(r => r.rules && r.rules.length > 0)
    @ValidateNested({each: true})
    @Type(() => RuleDto)
    rules: RuleDto[];

    @AutoMap()
    available: string | boolean;

    @AutoMap()
    confirmations?: number;
}
