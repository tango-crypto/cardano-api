import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDto } from 'src/models/dto/Address.dto';
import { StakeDto } from 'src/models/dto/Stake.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { StakesService } from './stakes.service';

@Controller(':accountId/wallets')
export class WalletsController {
	constructor(private readonly stakesService: StakesService) {}

	@Get(':stake_address')
	getStake(@Param('stake_address') stakeAddress: string): Promise<StakeDto> {
		return this.stakesService.get(stakeAddress);
	}

	@Get(':stake_address/addresses')
	getStakeAddresses(@Param('stake_address') stakeAddress: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AddressDto>> {
		return this.stakesService.getAddresses(stakeAddress, Number(size), order, pageToken);
	}
}
