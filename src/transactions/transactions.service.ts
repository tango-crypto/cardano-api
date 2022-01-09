import { hash_transaction, Transaction as SerializeTransaction } from '@emurgo/cardano-serialization-lib-nodejs';
import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Metadata, Transaction, Utxo } from '@tango-crypto/tango-ledger';
import { SQSClient, SendMessageCommand, SendMessageCommandInput, SQSClientConfig } from "@aws-sdk/client-sqs";
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransactionsService {
	client: SQSClient;

	constructor(private readonly ledger: TangoLedgerService, private readonly configService: ConfigService) {
		const config: SQSClientConfig = {
			region: this.configService.get<string>('AWS_REGION'),
		};
		const env = this.configService.get<string>('NODE_ENV');
		if (env == 'development') {
			config.credentials = fromIni({ profile: 'tangocrypto' });
		}
		this.client = new SQSClient(config);
	}

	async get(txHash: string): Promise<Transaction> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let tx = await this.ledger.dbClient.getTransaction(txHash);
		if (!tx) {
			throw APIError.notFound(`transaction: ${txHash}`);
		}
		return tx;
	}

	getUtxos(txHash: string): Promise<{hash: string, inputs: Utxo[], outputs: Utxo[]}> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		return this.ledger.dbClient.getTransactionUtxos(txHash);
	}

	getMetadata(txHash: string): Promise<Metadata[]> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		return this.ledger.dbClient.getTransactionMetadata(txHash);
	}

	async submit(userId: string, cborHex: string): Promise<string> {
		try {
			// get tx Id
			const txId = this.deserialize(cborHex);

			//send SQS message
			const region = this.configService.get<string>('AWS_REGION');
			const accountId = this.configService.get<string>('AWS_ACCOUNT_ID');
			const queueName = this.configService.get<string>('QUEUE_NAME');
			const network = this.configService.get<string>('NETWORK') || 'mainnet';
			const input: SendMessageCommandInput = {
				QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`,
				MessageBody: JSON.stringify({
					userId,
					txId,
					txBody: cborHex,
					network: network,
					timestamp: Date.now()
				})
			};
			const command = new SendMessageCommand(input);
			await this.client.send(command);
			return txId;
		} catch(err) {
			let errorMessage = err.isAxiosError && err.response && err.response.data ? err.response.data : err.message;
			throw APIError.badRequest(errorMessage || err);
		}
	}

	deserialize(cborHex: string) {
		const transaction = SerializeTransaction.from_bytes(Buffer.from(cborHex, 'hex'));
		const txBody = transaction.body();
		const txHash = hash_transaction(txBody);
		const txId = Buffer.from(txHash.to_bytes()).toString('hex');
		return txId;
	}
}
