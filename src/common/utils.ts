import * as crypto from 'crypto';
const algorithm = 'aes-256-ctr';
const secretKey = 'v1VH6sdmpNWjRRIqCc7gdxt01lwHzfr6';
const iv = Buffer.from('33f0e92dd0fda4efca202216ef0f0b27', 'hex');

import { Address, BaseAddress, ByronAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-nodejs";
import { AddressInfoDto } from "src/models/dto/AddressInfo.dto";
import { Asset, DbClient, Utxo } from '@tango-crypto/tango-ledger';
import { PlutusType, Seed } from 'src/utils/serialization.util';
import { Value } from 'src/models/Value';
import { ValueDto } from 'src/models/dto/Value.dto';

const CIP68_REFERENCE_PREFIX = '000643b0';
const CIP68_NFT_PREFIX = '000de140';
const CIP68_FT_PREFIX = '0014de40';
const CIP68_STANDARD: {[key:string|number]: number | string} = {
	[CIP68_REFERENCE_PREFIX]: 100, // Reference Token
	[CIP68_NFT_PREFIX]: 222, // NFT Token
	[CIP68_FT_PREFIX]: 333, // FT token

	// reverse
	[100]: CIP68_REFERENCE_PREFIX,
	[222]: CIP68_NFT_PREFIX,
	[333]: CIP68_FT_PREFIX,
}
const UNPRINTABLE_CHARACTERS_REGEXP = /[\p{Cc}\p{Cn}\p{Cs}]+/gu;

export class Utils {

	static coinSelection(utxos: Utxo[], requestedValue: Value, config: any, maxInputCount: number, checkMinUtxo = true): {selection: Utxo[], change?: Value} {
		let selection: Utxo[] = [];
		const selectedValue = new Value(); // empty
		const inputs = utxos.sort((a, b) => Number(a.value) - Number(b.value));
		let lockedAda = 0;
		while (!selectedValue.isFulfilled(requestedValue)) {
			if (inputs.length == 0) {
				throw new Error(`Insufficient UTxO balance`);
			}

			const utxo = inputs.pop();
			const [spendable, total] = Utils.getSpendable(utxo, config, 'hex');
			const value = new Value(spendable, utxo.assets);
			// UTxO doesn't provide assets (needed or not) and doesn't provide ADA (needed or not)
			if ((selectedValue.isAssetFulfilled(requestedValue) || !value.containsAsset(requestedValue)) && (value.isAssetOnly() || selectedValue.isCoinFulfilled(requestedValue))) {
				continue;
			}

			lockedAda += total - spendable;
			selection.push(utxo);
			selectedValue.add(value);

			if (selection.length > maxInputCount) {
				throw new Error(`Maximum transaction inputs: ${maxInputCount} exceeded`);
			}
		}

		if (lockedAda > 0) {
			selectedValue.addAda(lockedAda);
		}

		if (checkMinUtxo) {
			const change = selectedValue.clone().sub(requestedValue);
			const minUtxo = Seed.getMinUtxoValueWithAssets(selection[0].address, [...change.assets.values()], null, null, config, 'hex');
			if (change.coin < minUtxo) {
				const { selection: additional } = Utils.coinSelection(
					inputs, 
					new Value(minUtxo - change.coin), 
					config, 
					(maxInputCount ? maxInputCount - selection.length : undefined),
					false);
				for (let utxo of additional) {
					selection.push(utxo);
					selectedValue.add(new Value(Number(utxo.value), utxo.assets));
				}
			}
		}

		return { selection, change: selectedValue.sub(requestedValue) }
	}

	static async getAllUtxos(ledger: DbClient, address: string, size = 50, order = 'desc', decoding: BufferEncoding = 'utf8' ): Promise<Utxo[]> {
		let pageToken = '';
		const result: Utxo[] = [];
		do {
			const { utxos, cursor } = await Utils.getUtxos(ledger, address,size, order, pageToken, decoding);
			result.push(...utxos);
			pageToken = cursor;
		}
		while (pageToken)
		return result;
	}

	static async getUtxos(ledger: DbClient, address: string, size: number, order: string, pageToken: string, encoding: BufferEncoding = 'utf8'): Promise<{utxos: Utxo[], cursor: string | null}> {
		let txId = 0;
		let index = 0;
		try {
			const decr = Utils.decrypt(pageToken).split('-');
			const number = decr[0] ? Number(decr[0]) : Number.NaN;
			const i = decr[1] ? Number(decr[1]) : Number.NaN;
			txId = !Number.isNaN(number) ? number : 0;
			index = !Number.isNaN(i) ? i : 0;
		} catch(err) {
			// return Promise.reject(new Error('Invalid page token'));
		}
		// order = 'desc'; // WARNING!!! We need to figure it out why ASC query plan is consuming more rows :(
		const utxos = await ledger.getAddressUtxos(address, size + 1, order, txId, index);
		const [nextPageToken, items] = utxos.length <= size ? [null, utxos]: [Utils.encrypt(`${utxos[size - 1].tx_id}-${utxos[size - 1].index}`), utxos.slice(0, size)];
		return { utxos: encoding != 'utf8' ? items.map(utxo => ({
			...utxo, 
			assets: (utxo.assets || []).map(asset => ({
				...asset,
				asset_name: Utils.convertAssetName(asset.asset_name, asset.asset_name_label)
			})) 
		})) : items, cursor: nextPageToken };
	}

	static convertAssetName(asset_name: string, asset_name_label?: number): string {
		const { utf8 } = Utils.isPrintableUtf8(asset_name, 'utf8'); // assume the asset_name is in utf8
		const real_name = (utf8 ? Utils.toHex(asset_name) : asset_name);
		return (asset_name_label ? CIP68_STANDARD[asset_name_label] : '') + real_name;
	}

	static isPrintableUtf8(text: string, encoding: BufferEncoding = 'hex'): { utf8: boolean, text: string} {
		try {
			const t = Buffer.from(text, encoding).toString('utf8');
			return { utf8: !UNPRINTABLE_CHARACTERS_REGEXP.test(t), text: t};
		} catch (error) {
			return { utf8: false, text }
		}
	}

	static toHex(asset_name: string): string {
		return Buffer.from(asset_name, 'utf8').toString('hex');
	}


	static getSpendable(utxo: Utxo, config: any, encoding: BufferEncoding = 'hex'): number[] {
		const assets = utxo.assets || [];
		const total = Number(utxo.value);
		if (assets.length == 0) {
			return [total, total];
		}
		const datum = utxo.datum_hash ? Seed.getDataHash(utxo.datum_hash) : utxo.datum?.hash ? Seed.getDataHash(utxo.datum?.hash) : null ;
		const scriptRef = utxo.reference_script ? Seed.getScriptRef(utxo.reference_script.type as PlutusType, utxo.reference_script.code) : null;
		const minAda = Seed.getMinUtxoValueWithAssets(utxo.address, assets, datum, scriptRef, config, encoding);
		return [total - minAda, total];
	}

	static getAssetsMatch(value: {[key: string]: number}, assets: Asset[]) {
		return assets?.filter(asset => value[asset.policy_id+asset.asset_name] > 0);
	}

	static subAssets(value: {[key: string]: number}, assets: Asset[]) {
		const result = { ...value }; // copy
		for (const asset of assets) {
			const unit = asset.policy_id+asset.asset_name;
			if (result[unit]) {
				result[unit] -= asset.quantity;
			}
		}
		return result;
	}

	static isValueFulfilled(value: { lovelace: number, assets: {[key: string]: number} }): boolean {
		return value.lovelace <= 0 && Object.values(value.assets).every(q => q <= 0);
	}

	static isValidAddress(address: string): boolean {
		try {
			const addr = ByronAddress.is_valid(address) ? ByronAddress.from_base58(address).to_address() : Address.from_bech32(address);
			return !!addr;
		} catch(err) {
			console.log('Invalid address:', address, err);
			return false;
		}
	}
	static getAddressInfo(address: string): AddressInfoDto {
		const addr = Address.from_bech32(address);
		const baseAddr = BaseAddress.from_address(addr);
		let stakeAddr = ''
		if (baseAddr) {
			const stakeCredential = baseAddr.stake_cred();
			const reward = RewardAddress.new(addr.network_id(), stakeCredential);
			stakeAddr = reward.to_address().to_bech32();
		}
		return { network: addr.network_id() === 1 ? 'mainnet' : 'testnet', stake_address: stakeAddr};
	}

	static encrypt(text: crypto.BinaryLike): string {
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return encrypted.toString('hex');
    }

    static decrypt(hash: string): string {
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash, 'hex')), decipher.final()]);
        return decrpyted.toString();
    }
}