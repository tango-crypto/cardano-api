import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { Utils } from 'src/common/utils';
import { AddressDetail } from 'src/models/AddressDetail';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Transaction, Utxo, Asset } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Injectable()
export class AddressesService {
	constructor(private readonly ledger: TangoLedgerService) {}

	async get(address: string): Promise<AddressDetail> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		try {
			let { network, stake_address } = Utils.getAddressInfo(address);
			const t = Date.now();
			const info =  await Promise.all([
				this.callPromise(this.ledger.dbClient.getAddressBalance(address), 'balance'),
				this.callPromise(this.ledger.dbClient.getAddressTransactionsTotal(address), 'total tx'),
				this.callPromise(this.ledger.dbClient.getAddressAssets(address), 'assets'),
				this.callPromise(this.ledger.dbClient.getAddressUtxos(address, 50), 'utxos')
			])
			return {
				network,
				address,
				stake_address,
				balance: Number(info[0]),
				transactions_count: Number(info[1]),
				assets: info[2],
				utxos: info[3]
			};
		} catch(err) {
			console.log(err);
			throw APIError.badRequest(`invalid address: ${address}`);
		}
	}

	
	getAssets(address: string): Promise<Asset[]> {
		return this.ledger.dbClient.getAddressAssets(address);
	}

	async getUtxos(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<Utxo>> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		order = 'desc'; // WARNING!!! We need to figure it out why ASC query plan is consuming more rows :(
		const utxos = await this.ledger.dbClient.getAddressUtxos(address, size, order, txId);
		const nextPageToken = utxos.length == 0 ? null: Utils.encrypt(utxos[utxos.length - 1].tx_id.toString());
		return { result: utxos, nextPageToken };
	}

	async getTransactions(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<Transaction>> {
		// Utils.checkDataBaseConnection(dbClient);
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		order = 'desc'; // WARNING!!! We need to figure it out why ASC query plan is consuming more rows :(
		const txs = await this.ledger.dbClient.getAddressTransactions(address, size, order, txId);
		const nextPageToken = txs.length == 0 ? null: Utils.encrypt(txs[txs.length - 1].id.toString());
		return { result: txs, nextPageToken };
	}


	async callPromise<T>(p: Promise<T>, name: string) {
		const t = Date.now();
		console.log('Calling at:', t);
		return p.then(r => { console.log(name, Date.now() - t, 'ms'); return r})
	}
}
