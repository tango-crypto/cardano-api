import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Address, Stake } from 'tango-ledger';

@Injectable()
export class StakesService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async get(stakeAddress: string): Promise<Stake> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let stake = await this.ledger.dbClient.getStake(stakeAddress);
		if (!stake) {
			throw APIError.notFound(`stake: ${stakeAddress}`);
		} 
		return stake;
	}

	getAddresses(stakeAddress: string): Promise<Address[]> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		return this.ledger.dbClient.getStakeAddresses(stakeAddress);
	}

}
