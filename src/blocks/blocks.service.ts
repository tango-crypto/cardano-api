import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Block, Transaction } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { BlockDto } from 'src/models/dto/Block.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';

@Injectable()
export class BlocksService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async get(blockNumber: number): Promise<BlockDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		try {
			let block = await this.ledger.dbClient.getBlock(blockNumber);
			if (!block) {
				throw APIError.notFound(`block number: ${blockNumber}`);
			}
			return this.mapper.map<Block, BlockDto>(block, 'Block', 'BlockDto');
		} catch (err) {
			throw APIError.isNotFoundError(err) ? err : APIError.badRequest(`invalid block number: ${blockNumber}`);
		}
	}

	async getByHash(blockHash: string): Promise<BlockDto> {
		try {
			let block = await this.ledger.dbClient.getBlock(blockHash);
			if (!block) {
				throw APIError.notFound(`block hash: ${blockHash}`);
			}
			return this.mapper.map<Block, BlockDto>(block, 'Block', 'BlockDto');
		} catch (err) {
			throw APIError.isNotFoundError(err) ? err : APIError.badRequest(`invalid block hash: ${blockHash}`);
		}
	}

	async getLatest(): Promise<BlockDto> {
		const block = await this.ledger.dbClient.getLatestBlock();
		return this.mapper.map<Block, BlockDto>(block, 'Block', 'BlockDto');
	}

	async getBlockTransactions(blockHashOrNumber: number | string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<TransactionDto>> {
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		const txs = await this.ledger.dbClient.getBlockTransactions(blockHashOrNumber, size + 1, order, txId);
		const [nextPageToken, items] = txs.length <= size ? [null, txs]: [Utils.encrypt(txs[size - 1].id.toString()), txs.slice(0, size)];
		const data = this.mapper.mapArray<Transaction, TransactionDto>(items, 'Transaction', 'TransactionDto');
		return { data: data, cursor: nextPageToken };
	}
}
