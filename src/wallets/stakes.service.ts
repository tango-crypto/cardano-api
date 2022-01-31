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
		let txId = 0;
		let index = 0;
		try {
			const decr = Utils.decrypt(pageToken).split('-');
			const numberTx = decr[0] ? Number(decr[0]) : Number.NaN;
			txId = !Number.isNaN(numberTx) ? numberTx : 0;
			const numberIndex = decr[1] ? Number(decr[1]) : Number.NaN;
			index = !Number.isNaN(numberIndex) ? numberIndex : 0;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const addresses = await this.ledger.dbClient.getStakeAddresses(stakeAddress, size, order, txId, index);
		if (addresses.length == 0) {
			return { data: addresses.map(a => ({address: a.address})) }
		} else {
			const lastAddress = addresses[addresses.length - 1];
			const nextPageToken = addresses.length == 0 ? null: Utils.encrypt(`${lastAddress.tx_id}-${lastAddress.index}`);
			return { data: addresses.map(a => ({address: a.address})), cursor: nextPageToken};
		}
	}

}
