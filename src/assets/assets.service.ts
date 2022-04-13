import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Asset, AssetOwner } from '@tango-crypto/tango-ledger';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { AssetOwnerDto } from 'src/models/dto/AssetOwner.dto';

@Injectable()
export class AssetsService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async get(identifier: string): Promise<AssetDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let asset = identifier.startsWith("asset") 
			? await this.ledger.dbClient.getAssetByFingerprint(identifier) 
			: await this.ledger.dbClient.getAsset(identifier);
		if (!asset) {
			throw APIError.notFound(`asset: ${identifier}`);
		}
		return this.mapper.map<Asset, AssetDto>(asset, 'AssetDto', 'Asset');
	}

	async getOwners(identifier: string, size: number, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AssetOwnerDto>> {
		let address = '';
		let quantity = '';
		try {
			const decrypt = Utils.decrypt(pageToken);
			if (decrypt) {
				[address, quantity] = Utils.decrypt(pageToken).split('-');
			}
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		try {

			const owners = identifier.startsWith("asset") 
			? await this.ledger.dbClient.getAssetOwnersByFingerprint(identifier, size + 1, order, address, quantity)
			: await this.ledger.dbClient.getAssetOwners(identifier, size + 1, order, address, quantity);
			const [nextPageToken, items] = owners.length <= size ? [null, owners] : [Utils.encrypt(owners[size - 1].address + '-' + owners[size - 1].quantity), owners.slice(0, size)];
			const data = this.mapper.mapArray<AssetOwner, AssetOwnerDto>(items, 'AssetOwnerDto', 'AssetOwner');
			return {data, cursor: nextPageToken}
		} catch(err) {
			throw APIError.badRequest(`invalid asset identifier: ${identifier}`);
		}
	}
}
