import { Controller, Get, Param, Query } from '@nestjs/common';
import { PoolDto } from 'src/models/dto/Pool.dto';
import { PoolDelegationDto } from 'src/models/dto/PoolDelegation.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { PoolsService } from './pools.service';

@Controller(':accountId/pools')
export class PoolsController {
	constructor(private readonly poolsService: PoolsService) {}

	@Get(':id')
	getPool(@Param('id') id: string): Promise<PoolDto> {
		return this.poolsService.getPool(id);
	}

	@Get(':id/delegations')
	getDelegations(@Param('id') id: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<PoolDelegationDto>> {
		return this.poolsService.getDelegations(id, size, order, pageToken);
	}
}
