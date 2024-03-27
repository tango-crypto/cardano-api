import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresClient } from '@tangocrypto/tango-ledger';


@Injectable()
export class TangoLedgerService {
	dbClient: PostgresClient;

	constructor(private configService: ConfigService) {
		this.dbClient = new PostgresClient({
			connection: {
				host: this.configService.get<string>('DB_HOST'),
				port: this.configService.get<number>('DB_PORT'),
				user: this.configService.get<string>('DB_USER'),
				password: this.configService.get<string>('DB_PWD'),
				database: this.configService.get<string>('DB_NAME'),
				ssl: this.configService.get<string>('DB_SSL') == 'true'
			},
			debug: this.configService.get<string>('DB_DEBUG') == 'true'
		})
	}
}
