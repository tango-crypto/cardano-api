import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { PoolDelegation, Pool } from '@tangocrypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { PoolDto } from 'src/models/dto/Pool.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { PoolDelegationDto } from 'src/models/dto/PoolDelegation.dto';

@Injectable()
export class PoolsService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {}

	async getPool(poolId: string): Promise<PoolDto> {
		let pool = await this.ledger.dbClient.getPool(poolId);
		if (!pool) {
			throw APIError.notFound(`pool: ${poolId}`);
		}
		return this.mapper.map<Pool, PoolDto>(pool, 'Pool', 'PoolDto');
	}

	async getDelegations(poolId: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<PoolDelegationDto>> {
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const delegations = await this.ledger.dbClient.getDelegations(poolId, size + 1, order, txId);
		const [nextPageToken, items] = delegations.length <= size ? [null, delegations]: [Utils.encrypt(delegations[size - 1].tx_id.toString()), delegations.slice(0, size)];
		const data = this.mapper.mapArray<PoolDelegation, PoolDelegationDto>(items, 'PoolDelegation', 'PoolDelegationDto')
		return { data: data, cursor: nextPageToken};
	}
}
