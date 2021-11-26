import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Asset } from '@tango-crypto/tango-ledger';

@Injectable()
export class AssetsService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async get(identifier: string): Promise<Asset> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let asset = await this.ledger.dbClient.getAsset(identifier);
		if (!asset) {
			throw APIError.notFound(`asset: ${identifier}`);
		}
		return asset;
	}
}
