import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDbService as DynamoClient } from '@tango-crypto/tango-dynamodb';
import { AccountSubscription } from 'src/models/AccountSubscription.model';

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

    async getSubscription(accountId: string): Promise<AccountSubscription> {
        return this.client.getItem<AccountSubscription>(this.table, {PK: `ACCOUNT#${accountId}`, SK: 'SUBSCRIPTION'});
    }

    allowWebhookConfirmations(account: AccountSubscription, confirmations?: number): boolean {
        return account.tier != 'free' || !confirmations || confirmations == 0;
    }
}
