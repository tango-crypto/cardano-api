import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { Injectable } from '@nestjs/common';
import { Redeemer, Script } from '@tango-crypto/tango-ledger';
import { APIError } from 'src/common/errors';
import { ScriptDto } from 'src/models/dto/Script.dto';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Utils } from 'src/common/utils';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { RedeemerDto } from 'src/models/dto/Redeemer.dto';

@Injectable()
export class ScriptsService {
    constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {}

    async get(hash: string): Promise<ScriptDto> {
        let script = await this.ledger.dbClient.getScript(hash);
		if (!script) {
			throw APIError.notFound(`script: ${hash}`);
		}
		return this.mapper.map<Script, ScriptDto>(script, 'Script', 'ScriptDto');
    }

    async getRedeemers(hash: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<RedeemerDto>> {
		let tx_id = -1;
		let index = 0;
		try {
			const [tx, i] = Utils.decrypt(pageToken).split('-');
			tx_id = tx ? Number(tx) : -1;
			index = i ? Number(i): 0;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
        const redeemers = await this.ledger.dbClient.getScriptRedeemers(hash, size + 1, order, tx_id, index);
		const [nextPageToken, items] = redeemers.length <= size ? [null, redeemers] : [Utils.encrypt(`${redeemers[size - 1].tx_id}-${redeemers[size - 1].index}`), redeemers.slice(0, size)];
		const data = this.mapper.mapArray<Redeemer, RedeemerDto>(items, 'Redeemer', 'RedeemerDto')
		return { data: data, cursor: nextPageToken};
	}
}
