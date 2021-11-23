import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { EpochParameters } from 'tango-ledger';
@Injectable()
export class EpochsService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async getParameters(epoch: number): Promise<EpochParameters> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let parameters = await this.ledger.dbClient.getEpochParamters(epoch);
		if (!parameters) {
			throw APIError.notFound(`epoch: ${epoch}`);
		}
		return parameters;
	}
}
