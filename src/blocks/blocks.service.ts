import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Block } from '@tango-crypto/tango-ledger';

@Injectable()
export class BlocksService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async get(blockHashOrNumber: number|string): Promise<Block> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let block = await this.ledger.dbClient.getBlock(blockHashOrNumber);
		if (!block) {
			throw APIError.notFound(`block: ${blockHashOrNumber}`);
		}
		return block;
	}

	getLatest(): Promise<Block> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		return this.ledger.dbClient.getLatestBlock();
	}
}
