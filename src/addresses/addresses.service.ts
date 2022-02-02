import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { AddressDetailDto } from 'src/models/dto/AddressDetail.dto';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Transaction, Utxo, Asset } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';

@Injectable()
export class AddressesService {
	constructor(
		private readonly ledger: TangoLedgerService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {}

	async get(address: string): Promise<AddressDetailDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		try {
			let { network, stake_address } = Utils.getAddressInfo(address);
			const info =  await Promise.all([
				this.callPromise(this.ledger.dbClient.getAddressBalance(address), 'balance'),
				this.callPromise(this.ledger.dbClient.getAddressTransactionsTotal(address), 'total tx'),
				// this.callPromise(this.ledger.dbClient.getAddressAssets(address), 'assets'),
				// this.callPromise(this.ledger.dbClient.getAddressUtxos(address, 50), 'utxos')
			])
			return {
				network,
				address,
				stake_address,
				balance: Number(info[0]),
				transactions_count: Number(info[1]),
				// assets: info[2],
				// utxos: info[3]
			};
		} catch(err) {
			console.log(err);
			throw APIError.badRequest(`invalid address: ${address}`);
		}
	}

	
	async getAssets(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AssetDto>> {
		let fingerprint = '';
		try {
			fingerprint = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const assets = await this.ledger.dbClient.getAddressAssets(address, size, order, fingerprint);
		const data = this.mapper.mapArray<Asset, AssetDto>(assets, 'AssetDto', 'Asset');
		const nextPageToken = data.length == 0 ? null: Utils.encrypt(data[data.length - 1].fingerprint.toString());
		return {data, cursor: nextPageToken}
	}

	async getUtxos(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<UtxoDto>> {
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
		const data = this.mapper.mapArray<Utxo, UtxoDto>(utxos, 'UtxoDto', 'Utxo');
		return { data: data, cursor: nextPageToken };
	}

	async getTransactions(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<TransactionDto>> {
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
		const data = this.mapper.mapArray<Transaction, TransactionDto>(txs, 'TransactionDto', 'Transaction');
		const nextPageToken = data.length == 0 ? null: Utils.encrypt(data[data.length - 1].id.toString());
		return { data: data, cursor: nextPageToken };
	}


	async callPromise<T>(p: Promise<T>, name: string) {
		const t = Date.now();
		console.log('Calling at:', t);
		return p.then(r => { console.log(name, Date.now() - t, 'ms'); return r})
	}
}
