import { hash_transaction, Transaction as SerializeTransaction } from '@emurgo/cardano-serialization-lib-nodejs';
import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Metadata, Transaction, Utxo } from '@tango-crypto/tango-ledger';
import { SQSClient, SendMessageCommand, SendMessageCommandInput, SQSClientConfig } from "@aws-sdk/client-sqs";
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { MetadataDto } from 'src/models/dto/Metadata.dto';

@Injectable()
export class TransactionsService {
	client: SQSClient;

	constructor(
		private readonly ledger: TangoLedgerService, 
		private readonly configService: ConfigService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {
		const config: SQSClientConfig = {
			region: this.configService.get<string>('AWS_REGION'),
		};
		const env = this.configService.get<string>('NODE_ENV');
		if (env == 'development') {
			config.credentials = fromIni({ profile: 'tangocrypto' });
		}
		this.client = new SQSClient(config);
	}

	async get(txHash: string): Promise<TransactionDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let tx = await this.ledger.dbClient.getTransaction(txHash);
		if (!tx) {
			throw APIError.notFound(`transaction: ${txHash}`);
		}
		const data = this.mapper.map<Transaction, TransactionDto>(tx, 'TransactionDto', 'Transaction');
		return data;
	}

	async getUtxos(txHash: string): Promise<{hash: string, inputs: UtxoDto[], outputs: UtxoDto[]}> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		const { hash, inputs, outputs} = await this.ledger.dbClient.getTransactionUtxos(txHash);
		const inputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(inputs, 'UtxoDto', 'Utxo');
		const outputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(outputs, 'UtxoDto', 'Utxo');
		return {hash, inputs: inputUtxos, outputs: outputUtxos};
	}

	async getMetadata(txHash: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<MetadataDto>> {
		let key = -1;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			key = !Number.isNaN(number) ? number : -1;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const metadata = await this.ledger.dbClient.getTransactionMetadata(txHash, size, order, key);
		const data = this.mapper.mapArray<Metadata, MetadataDto>(metadata, 'MetadataDto', 'Metadata');
		const nextPageToken = data.length == 0 ? null : Utils.encrypt(data[data.length - 1].label)
		return { data: data, cursor: nextPageToken };
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
			const eventKey = crypto.randomUUID().replace(/-/g, '');
			const input: SendMessageCommandInput = {
				QueueUrl: `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`,
				MessageBody: JSON.stringify({
					eventKey,
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
