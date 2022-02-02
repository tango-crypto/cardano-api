import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Asset } from '@tango-crypto/tango-ledger';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { AssetDto } from 'src/models/dto/Asset.dto';

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
}
