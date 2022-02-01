import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Address, Stake } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';

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

	async getAddresses(stakeAddress: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<Address>> {
		let address = '';
		try {
			address = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const addresses = await this.ledger.dbClient.getStakeAddresses(stakeAddress, size, order, address);
		const nextPageToken = addresses.length == 0 ? null: Utils.encrypt(addresses[addresses.length - 1].address.toString());
		return { data: addresses, cursor: nextPageToken };

	}

}
