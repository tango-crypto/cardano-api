import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mapping } from "cassandra-driver";
import { Subscription } from "src/webhooks/models/subscription.model";
import { ScyllaService } from "../scylla/scylla.service";
import { Webhook } from "src/webhooks/models/webhook.model";

@Injectable()
export class WebhookProvider {
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


    async findOne(userId: string, webhookId: string): Promise<Webhook> {
        const result = await this.webhookMapper.find({ user_id: userId, webhook_id: webhookId });
        return result.first();
    }

    async findAll(userId: string, state?: string, size: number = 100): Promise<{items: Webhook[], state: string}> {
        const result = await this.scyllaService.execute<Webhook>('SELECT * FROM webhooks', { user_id: userId }, { prepare: true, fetchSize: size, pageState: state });
        return result;
    }

    async update(userId: string, webhookId: string, data: { [key: string]: any }): Promise<Webhook> {
        const result = await this.webhookMapper.update({ user_id: userId, webhook_id: webhookId, ...data }, { ifExists: true });
        return result.first();
    }

    async create(userId: string, webhookId: string, data: { [key: string]: any }): Promise<Webhook> {
        const obj = { user_id: userId, webhook_id: webhookId, ...data };
        const params = Object.values(obj);
        const columns = Object.keys(obj);
        const sql = `INSERT INTO webhooks (${columns.join(',')}) VALUES (${Array(columns.length).fill('?').join(',')}) IF NOT EXISTS`;
        const result = await this.scyllaService.execute<Webhook>(sql, params, { prepare: true });
        return result.items[0];
    }

    async delete(userId: string, webhookId: string): Promise<boolean> {
        const result = await this.webhookMapper.remove({ user_id: userId, webhook_id: webhookId }, { ifExists: true });
        return result.wasApplied();
    }
}