import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Delegation } from 'tango-ledger';

@Injectable()
export class PoolsService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async getDelagation(poolId: string): Promise<Delegation> {
		let delegation = await this.ledger.dbClient.getDelegation(poolId);
		if (!delegation) {
			throw APIError.notFound(`pool: ${poolId}`);
		}
		return delegation
	} 
}
