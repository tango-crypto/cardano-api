import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { DatumDto } from 'src/models/dto/Datum.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { Datum} from '@tango-crypto/tango-ledger';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';

@Injectable()
export class DatumsService {
    constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {}

    async get(hash: string): Promise<DatumDto> {
        let datum = await this.ledger.dbClient.getDatum(hash);
		if (!datum) {
			throw APIError.notFound(`datum: ${hash}`);
		}
		return this.mapper.map<Datum, DatumDto>(datum, 'DatumDto', 'Datum');
    }
}
