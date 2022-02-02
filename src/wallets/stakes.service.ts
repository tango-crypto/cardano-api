import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Address, Stake } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { StakeDto } from 'src/models/dto/Stake.dto';
import { AddressDto } from 'src/models/dto/Address.dto';

@Injectable()
export class StakesService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async get(stakeAddress: string): Promise<StakeDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let stake = await this.ledger.dbClient.getStake(stakeAddress);
		if (!stake) {
			throw APIError.notFound(`stake: ${stakeAddress}`);
		}
		return this.mapper.map<Stake, StakeDto>(stake, 'StakeDto', 'Stake');
	}

	async getAddresses(stakeAddress: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AddressDto>> {
		let address = '';
		try {
			address = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const addresses = await this.ledger.dbClient.getStakeAddresses(stakeAddress, size, order, address);
		const nextPageToken = addresses.length == 0 ? null: Utils.encrypt(addresses[addresses.length - 1].address.toString());
		const data = this.mapper.mapArray<Address, AddressDto>(addresses, 'AddressDto', 'Address');
		return { data: data, cursor: nextPageToken };

	}

}
