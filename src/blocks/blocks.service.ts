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

	async get(blockHashOrNumber: number|string): Promise<BlockDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let block = await this.ledger.dbClient.getBlock(blockHashOrNumber);
		if (!block) {
			throw APIError.notFound(`block: ${blockHashOrNumber}`);
		}
		return this.mapper.map<Block, BlockDto>(block, 'BlockDto', 'Block');
	}

	async getLatest(): Promise<BlockDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		const block = await this.ledger.dbClient.getLatestBlock();
		return this.mapper.map<Block, BlockDto>(block, 'BlockDto', 'Block');
	}

	async getBlockTransactions(blockNumber: number, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<TransactionDto>> {
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		const txs = await this.ledger.dbClient.getBlockTransactions(blockNumber, size, order, txId);
		const nextPageToken = txs.length == 0 ? null: Utils.encrypt(txs[txs.length - 1].id.toString());
		const data = this.mapper.mapArray<Transaction, TransactionDto>(txs, 'TransactionDto', 'Transaction');
		return { data: data, cursor: nextPageToken };
	}
}
