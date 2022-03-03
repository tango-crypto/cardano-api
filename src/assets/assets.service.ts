import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Asset, Address } from '@tango-crypto/tango-ledger';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { AddressDto } from 'src/models/dto/Address.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Injectable()
export class AssetsService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async get(identifier: string): Promise<AssetDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let asset = await this.ledger.dbClient.getAsset(identifier);
		if (!asset) {
			throw APIError.notFound(`asset: ${identifier}`);
		}
		return this.mapper.map<Asset, AssetDto>(asset, 'AssetDto', 'Asset');
	}

	async getAddresses(identifier: string, size: number, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AddressDto>> {
		let address = '';
		try {
			address = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const addresses = await this.ledger.dbClient.getAssetAddresses(identifier, size + 1, order, address);
		const [nextPageToken, items] = addresses.length <= size ? [null, addresses] : [Utils.encrypt(addresses[size - 1].address.toString()), addresses.slice(0, size)];
		const data = this.mapper.mapArray<Address, AddressDto>(items, 'AddressDto', 'Address');
		return {data, cursor: nextPageToken}
	}
}
