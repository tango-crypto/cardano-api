import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDbService as DynamoClient } from '@tango-crypto/tango-dynamodb';
import { Account } from 'src/webhooks/models/account.model';
import { Subscription } from 'src/webhooks/models/subscription.model';

@Injectable()
export class AccountService {
    client: DynamoClient;
    table: string;

    constructor(private readonly configService: ConfigService) {
        const config: DynamoDBClientConfig = {
            region: this.configService.get<string>('AWS_REGION'),
        };
        const env = this.configService.get<string>('NODE_ENV');
        if (env == 'development') {
            config.credentials = fromIni({ profile: 'tangocrypto' });
        }

        this.client = new DynamoClient(config);
        this.table = this.configService.get<string>('DYNAMO_DB_ACCOUNT_TABLE_NAME');
    }

    async getAccount(id: string, keyHash?: string): Promise<Account> {
        const keyConditions = [
			{ key: 'PK', expr: 'pk', op: '=' }			
		];
		const exprAttrs = {
			'pk': `ACCOUNT#${id}`
		};
		let records = [];
		let token = '';
		do {
			const {items, nextToken} = await this.client.getItems<any>(this.table, keyConditions, null, exprAttrs, null, 50, token);
			if (items.length == 0 && !token) {
				return null;
			}
			records.push(...items);
			token = nextToken;
		} while(token);
		let item: {id: string, subscription: any[], applications: any[], webhooks: any[]} = records.reduce((acc, cur) => {
			let {type, ...attrs} = cur;
			(acc[type] = acc[type] || []).push(attrs);
			return acc;
		}, {id: id, subscription: [], applications: [], webhooks: []});
		const api_key_hash = item.subscription[0].api_key_hash;
        const account: Account = {
            id: id,
            subscription: item.subscription[0],
            applications: item.applications,
            webhooks: item.webhooks
        }
		if (keyHash) {
			account.subscription.api_key_hash = api_key_hash;
		}
		return account;
    }

    async getSubscription(accountId: string): Promise<Subscription> {
        const { item, $error } = await this.client.getItem<Subscription>(this.table, {PK: `ACCOUNT#${accountId}`, SK: 'SUBSCRIPTION'});
        if ($error) {
            return null;
        } 
        return item;
    }

    allowWebhookConfirmations(account: Subscription, confirmations?: number): boolean {
        return account.tier != 'free' || !confirmations || confirmations == 0;
    }
}
