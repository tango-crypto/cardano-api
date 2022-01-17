import { RuleDto } from "./rule.dto";

export class UpdateWebhookDto {
    address?: string;
    type?: string;
    name?: string;
    network?: string;
    description?: string;
    callback_url?: string;
    rules?: RuleDto[];
    available?: string;
}
