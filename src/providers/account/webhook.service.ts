import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mapping } from "cassandra-driver";
import { Subscription } from "src/webhooks/models/subscription.model";
import { ScyllaService } from "../scylla/scylla.service";
import { Webhook } from "src/webhooks/models/webhook.model";

@Injectable()
export class WebhookService {
    table: string;
    webhookMapper: mapping.ModelMapper<Webhook>;

    constructor(private readonly configService: ConfigService, private scyllaService: ScyllaService) { 
        const mappingOptions: mapping.MappingOptions = {
            models: {
                'Webhook': {
                    tables: ['webhooks'],
                    mappings: new mapping.DefaultTableMappings
                },
            }
        }

        this.webhookMapper = this.scyllaService.createMapper(mappingOptions).forModel('Webhook');
    }


    async findOne(userId: string, wbkId: string): Promise<Webhook> {
        const result = await this.webhookMapper.find({ user_id: userId, webhook_id: wbkId });
        return result.first();
    }

    async findAll(userId: string): Promise<Webhook[]> {
        const result = await this.webhookMapper.find({ user_id: userId });
        return result.toArray();
    }
}