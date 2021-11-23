import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { Utils } from 'src/common/utils';
import { AddressDetail } from 'src/models/AddressDetail';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Transaction, Utxo, Asset } from 'tango-ledger';

@Injectable()
export class AddressesService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async get(address: string): Promise<AddressDetail> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		try {
			let { network, stake_address } = Utils.getAddressInfo(address);
			let utxos = await this.ledger.dbClient.getAddressUtxos(address);
			let ada = 0;
			let assets: Asset[] = [];
			for (const utxo of utxos) {
				ada += utxo.value - 0;
				assets.push(...utxo.assets);
			}
			return { 
				network,
				address, 
				stake_address, 
				ada,
				assets
			};
		} catch(err) {
			throw APIError.badRequest(`invalid address: ${address}`);
		}
	}

	getUtxos(address: string): Promise<Utxo[]> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		return this.ledger.dbClient.getAddressUtxos(address);
	}

	getTransactions(address: string, order: string): Promise<Transaction[]> {
		// Utils.checkDataBaseConnection(dbClient);
		return this.ledger.dbClient.getAddressTransactions(address, order);
	}
}
