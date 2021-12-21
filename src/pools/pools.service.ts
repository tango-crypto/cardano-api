import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { PoolDelegation, Pool } from '@tango-crypto/tango-ledger';

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

	async getDelegations(poolId: string): Promise<PoolDelegation[]> {
		return this.ledger.dbClient.getDelegations(poolId);
	}
}
