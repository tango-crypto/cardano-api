import { Controller, Get, Param, Query } from '@nestjs/common';
import { Address, Stake } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { StakesService } from './stakes.service';

@Controller(':accountId/wallets')
export class WalletsController {
	constructor(private readonly stakesService: StakesService) {}

	@Get(':stake_address')
	getStake(@Param('stake_address') stakeAddress: string): Promise<Stake> {
		return this.stakesService.get(stakeAddress);
	}

	@Get(':stake_address/addresses')
	getStakeAddresses(@Param('stake_address') stakeAddress: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<Address>> {
		return this.stakesService.getAddresses(stakeAddress, size, order, pageToken);
	}
}
