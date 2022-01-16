import { RuleDto } from "./rule.dto";

export class UpdateWebhookDto {
      webhook_key?: string;
      name?: string;
      network?: string;
      description?: string;
      callback_url?: string;
      rules?: RuleDto[];
      update_date?: string;
      available?: string;
}
