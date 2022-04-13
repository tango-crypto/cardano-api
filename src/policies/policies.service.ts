import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Utils } from 'src/common/utils';
import { Asset } from '@tango-crypto/tango-ledger';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { APIError } from 'src/common/errors';

@Injectable()
export class PoliciesService {
    constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
	) {}


    async getAssets(policyId: string, size: number, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AssetDto>> {
		let fingerprint = '';
		try {
			fingerprint = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
        try {
            const assets = await this.ledger.dbClient.getPolicyAssets(policyId, size + 1, order, fingerprint);
            const [nextPageToken, items] = assets.length <= size ? [null, assets] : [Utils.encrypt(assets[size - 1].fingerprint.toString()), assets.slice(0, size)];
            const data = this.mapper.mapArray<Asset, AssetDto>(items, 'AssetDto', 'Asset');
            return {data, cursor: nextPageToken}
        } catch(err) {
            throw APIError.badRequest(`invalid policy: ${policyId}`);
        }
	}
}
