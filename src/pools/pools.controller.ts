import { Controller, Get, Param } from '@nestjs/common';
import { Delegation } from '@tango-crypto/tango-ledger';
import { PoolsService } from './pools.service';

@Controller(':accountId/pools')
export class PoolsController {
	constructor(private readonly poolsService: PoolsService) {}

	@Get(':id/metadata')
	getMetadata(@Param('id') id: string): Promise<Delegation> {
		return this.poolsService.getDelagation(id);
	}
}
