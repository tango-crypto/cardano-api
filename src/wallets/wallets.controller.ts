import { Controller, Get, Param } from '@nestjs/common';
import { Address, Stake } from '@tango-crypto/tango-ledger';
import { StakesService } from './stakes.service';

@Controller(':accountId/wallets')
export class WalletsController {
	constructor(private readonly stakesService: StakesService) {}

	@Get(':stake_address')
	getStake(@Param('stake_address') stakeAddress: string): Promise<Stake> {
		return this.stakesService.get(stakeAddress);
	}

	@Get(':stake_address/addresses')
	getStakeAddresses(@Param('stake_address') stakeAddress: string): Promise<Address[]> {
		return this.stakesService.getAddresses(stakeAddress);
	}
}
