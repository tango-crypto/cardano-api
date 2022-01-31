import { Controller, Get, Param, Query } from '@nestjs/common';
import { PoolDelegation, Pool } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { PoolsService } from './pools.service';

@Controller(':accountId/pools')
export class PoolsController {
	constructor(private readonly poolsService: PoolsService) {}

	@Get(':id/metadata')
	getMetadata(@Param('id') id: string): Promise<Pool> {
		return this.poolsService.getPool(id);
	}

	@Get(':id/delegations')
	getDelegations(@Param('id') id: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<PoolDelegation>> {
		return this.poolsService.getDelegations(id, size, order, pageToken);
	}
}
