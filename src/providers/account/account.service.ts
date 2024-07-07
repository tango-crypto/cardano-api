import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account } from 'src/webhooks/models/account.model';
import { Subscription } from 'src/webhooks/models/subscription.model';
import { ScyllaService } from '../scylla/scylla.service';
import { mapping } from 'cassandra-driver';
import { User } from 'src/webhooks/models/user.model';
import { Webhook } from 'src/webhooks/models/webhook.model';
import { Application } from 'src/webhooks/models/application.model';
import { SubscriptionService } from './subscription.service';
import { ApplicationService } from './application.service';
import { WebhookProvider } from '../webhooks/webhook.provider';

@Injectable()
export class AccountService {
    table: string;
    userMapper: mapping.ModelMapper<User>;
    webhookMapper: mapping.ModelMapper<Webhook>;

    constructor(private subscriptionService: SubscriptionService, private applicationService: ApplicationService, private webhookService: WebhookProvider, private scyllaService: ScyllaService) {
        const mappingOptions: mapping.MappingOptions = {
            models: {
                'User': {
                    tables: ['users'],
                    mappings: new mapping.DefaultTableMappings
                },
                'Webhook': {
                    tables: ['webhooks'],
                    mappings: new mapping.DefaultTableMappings
                }
            }
        }

        this.webhookMapper = this.scyllaService.createMapper(mappingOptions).forModel('Webhook');
        this.userMapper = this.scyllaService.createMapper(mappingOptions).forModel('User');
    }

    async findOne(id: string): Promise<Account> {
        const result = await this.subscriptionService.findOne(id);
        if (!result) return null;
        const applications = await this.applicationService.findAll(id);
        // TODO: use real webhooks service here
        // const webhooks = await this.webhookService.findAll(id);
        const webhooks = [];
        const { user_id,
            user_first_name,
            user_last_name,
            user_email,
            user_password, 
            user_start_time,
            user_end_time,
            user_active,
            ...subscription } = result;
        const user = {
            id: user_id,
            first_name: user_first_name,
            last_name: user_last_name,
            email: user_email,
            password: user_password,
            start_time: user_start_time,
            end_time: user_end_time,
            active: user_active,
            subscription,
            applications,
            webhooks
        };
        return user;
    }

    async getSubscription(id: string): Promise<Subscription> {
        return this.subscriptionService.findOne(id);
    }

    allowWebhookConfirmations(account: Subscription, confirmations?: number): boolean {
        return account.tier != 'free' || !confirmations || confirmations == 0;
    }
}
