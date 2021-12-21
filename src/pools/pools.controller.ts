import { Controller, Get, Param } from '@nestjs/common';
import { PoolDelegation, Pool } from '@tango-crypto/tango-ledger';
import { PoolsService } from './pools.service';

@Controller(':accountId/pools')
export class PoolsController {
	constructor(private readonly poolsService: PoolsService) {}

	@Get(':id/metadata')
	getMetadata(@Param('id') id: string): Promise<Pool> {
		return this.poolsService.getPool(id);
	}

	@Get(':id/delegations')
	getDelegations(@Param('id') id: string): Promise<PoolDelegation[]> {
		return this.poolsService.getDelegations(id);
	}
}
