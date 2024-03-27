import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Epoch, EpochParameters } from '@tangocrypto/tango-ledger';
import { EpochDto } from 'src/models/dto/Epoch.dto';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { EpochParametersDto } from 'src/models/dto/EpochParameters.dto';
@Injectable()
export class EpochsService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async getLatest(): Promise<EpochDto> {
		const epoch = await this.ledger.dbClient.getLatestEpoch();
		return this.mapper.map<Epoch, EpochDto>(epoch, 'Epoch', 'EpochDto');
	}

	async getParameters(epoch: number): Promise<EpochParametersDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		const parameters = await this.ledger.dbClient.getEpochParameters(epoch);
		if (!parameters) {
			throw APIError.notFound(`parameters for epoch: ${epoch}`);
		}
		return this.mapper.map<EpochParameters, EpochParametersDto>(parameters, 'EpochParameters', 'EpochParametersDto');
	}
}
