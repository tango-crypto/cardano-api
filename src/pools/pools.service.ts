import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { PoolDelegation, Pool } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Injectable()
export class PoolsService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async getPool(poolId: string): Promise<Pool> {
		let pool = await this.ledger.dbClient.getPool(poolId);
		if (!pool) {
			throw APIError.notFound(`pool: ${poolId}`);
		}
		return pool;
	}

	async getDelegations(poolId: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<PoolDelegation>> {
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		order = 'desc';
		const delegations = await this.ledger.dbClient.getDelegations(poolId, size, order, txId);
		const nextPageToken = delegations.length == 0 ? null: Utils.encrypt(delegations[delegations.length - 1].tx_id.toString());
		return { data: delegations, cursor: nextPageToken};
	}
}
