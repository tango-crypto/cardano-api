import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mapping } from "cassandra-driver";
import { Subscription } from "src/webhooks/models/subscription.model";
import { ScyllaService } from "../scylla/scylla.service";

@Injectable()
export class SubscriptionService {
    table: string;
    subscriptionMapper: mapping.ModelMapper<Subscription>;

    constructor(private readonly configService: ConfigService, private scyllaService: ScyllaService) { 
        const mappingOptions: mapping.MappingOptions = {
            models: {
                'Subscription': {
                    tables: ['subscriptions'],
                    mappings: new mapping.DefaultTableMappings
                },
            }
        }

        this.subscriptionMapper = this.scyllaService.createMapper(mappingOptions).forModel('Subscription');
    }


    async findOne(userId: string): Promise<Subscription> {
        const result = await this.subscriptionMapper.find({ user_id: userId, active: true });
        return result.first();
    }
}