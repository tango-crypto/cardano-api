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
import { InspectAddress, inspectAddress } from 'cardano-addresses';
import { ValueDto } from 'src/models/dto/Value.dto';
import { ConfigService } from '@nestjs/config';
import { Mainnet, Testnet } from 'src/utils/config/network.config';
import { Value } from 'src/models/Value';
import { CoinSelectionDto } from 'src/models/dto/CoinSelection.dto';
import { MAX_TRANSACTION_INPUTS } from 'src/utils/constants';

@Injectable()
export class AddressesService {
	constructor(
		private readonly ledger: TangoLedgerService,
		private readonly configService: ConfigService,
		@InjectMapper('pojo-mapper') private mapper: Mapper) {}

	async get(address: string): Promise<AddressDetailDto> {
		if (!Utils.isValidAddress(address)) throw APIError.badRequest(`invalid address: ${address}`);
		let { network, stake_address } = Utils.getAddressInfo(address);
		const info =  await Promise.all([
			this.ledger.dbClient.getAddressBalance(address),
			this.ledger.dbClient.getAddressTransactionsTotal(address),
			// this.callPromise(this.ledger.dbClient.getAddressBalance(address), 'balance'),
			// this.callPromise(this.ledger.dbClient.getAddressTransactionsTotal(address), 'total tx'),
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
		
	}

	
	async getAssets(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AssetDto>> {
		if (!Utils.isValidAddress(address)) throw APIError.badRequest(`invalid address: ${address}`);
		let fingerprint = '';
		try {
			fingerprint = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const assets = await this.ledger.dbClient.getAddressAssets(address, size + 1, order, fingerprint);
		const [nextPageToken, items] = assets.length <= size ? [null, assets] : [Utils.encrypt(assets[size - 1].fingerprint.toString()), assets.slice(0, size)];
		const data = this.mapper.mapArray<Asset, AssetDto>(items, 'AssetDto', 'Asset');
		return {data, cursor: nextPageToken}
	}

	async getAssetUtxos(address: string, asset: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<UtxoDto>> {
		if (!Utils.isValidAddress(address)) throw APIError.badRequest(`invalid address: ${address}`);
		let tx_id = -1;
		let index = 0;
		try {
			const [tx, i] = Utils.decrypt(pageToken).split('-');
			tx_id = tx ? Number(tx) : -1;
			index = i ? Number(i): 0;
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const utxos = await this.ledger.dbClient.getAddressAssetUtxos(address, asset, size + 1, order, tx_id, index);
		const [nextPageToken, items] = utxos.length <= size ? [null, utxos] : [Utils.encrypt(`${utxos[size - 1].tx_id}-${utxos[size - 1].index}`), utxos.slice(0, size)];
		const data = this.mapper.mapArray<Utxo, UtxoDto>(items, 'UtxoDto', 'Utxo');
		return {data, cursor: nextPageToken}
	}

	async getUtxos(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<UtxoDto>> {
		if (!Utils.isValidAddress(address)) throw APIError.badRequest(`invalid address: ${address}`);
		const { utxos, cursor } = await Utils.getUtxos(this.ledger.dbClient, address, size, order, pageToken);
		const data = this.mapper.mapArray<Utxo, UtxoDto>(utxos, 'UtxoDto', 'Utxo');
		return { data: data, cursor };
	}

	async getTransactions(address: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<TransactionDto>> {
		if (!Utils.isValidAddress(address)) throw APIError.badRequest(`invalid address: ${address}`);
		let txId = 0;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		// order = 'desc'; // WARNING!!! We need to figure it out why ASC query plan is consuming more rows :(
		const txs = await this.ledger.dbClient.getAddressTransactions(address, size + 1, order, txId);
		const [nextPageToken, items] = txs.length <= size ? [null, txs]: [Utils.encrypt(txs[size - 1].id.toString()), txs.slice(0, size)];
		const data = this.mapper.mapArray<Transaction, TransactionDto>(items, 'TransactionDto', 'Transaction');
		return { data: data, cursor: nextPageToken };
	}

	async rawInfo(address: string, rootXPub?: string): Promise<InspectAddress> {
		try {
			return await inspectAddress(address, rootXPub);
		} catch (error) {
			return null;
		}
	}

	async coinSelection(address: string, { value, max_input_count, check_min_utxo }: CoinSelectionDto): Promise<{selection: UtxoDto[], change?: ValueDto}> {
		const utxos = await Utils.getAllUtxos(this.ledger.dbClient, address, 100, 'desc', 'hex');
		const config = this.configService.get<string>('NETWORK') != 'mainnet' ? Testnet : Mainnet;
		const checkMinUtxo = check_min_utxo != undefined ? check_min_utxo : true;
		const maxInputCount = Math.min(max_input_count || Number.MAX_SAFE_INTEGER, MAX_TRANSACTION_INPUTS);
		try {
			const { selection, change } = Utils.coinSelection(utxos, new Value(value.lovelace, value.assets), config, maxInputCount, checkMinUtxo);
			return { selection: this.mapper.mapArray<Utxo, UtxoDto>(selection, 'UtxoDto', 'Utxo'), change: this.mapper.map<Value, ValueDto>(change, 'ValueDto', 'Value') };
		} catch(err) {
			throw APIError.badRequest(err.message);
		}
	}


	async callPromise<T>(p: Promise<T>, name: string) {
		const t = Date.now();
		console.log('Calling at:', t);
		return p.then(r => { console.log(name, Date.now() - t, 'ms'); return r})
	}
}
