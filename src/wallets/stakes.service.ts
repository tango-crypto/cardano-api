import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { Seed } from 'src/utils/serialization.util';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Address, Stake, Utxo } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { StakeDto } from 'src/models/dto/Stake.dto';
import { AddressDto } from 'src/models/dto/Address.dto';
import { JsonScript, ScriptTypeEnum } from 'src/utils/models/json-script.model';
import { NativeScript } from 'src/models/dto/NativeScript.dto';
import { CoinSelectionDto } from 'src/models/dto/CoinSelection.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { ValueDto } from 'src/models/dto/Value.dto';
import { Testnet, Mainnet } from 'src/utils/config/network.config';
import { ConfigService } from '@nestjs/config';
import { Value } from 'src/models/Value';
import { MAX_TRANSACTION_INPUTS } from 'src/utils/constants';

@Injectable()
export class StakesService {
	
	constructor(
		private readonly ledger: TangoLedgerService,
		private readonly configService: ConfigService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
		) {}

	async get(stakeAddress: string): Promise<StakeDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let stake = await this.ledger.dbClient.getStake(stakeAddress);
		if (!stake) {
			throw APIError.notFound(`stake: ${stakeAddress}`);
		}
		return this.mapper.map<Stake, StakeDto>(stake, 'StakeDto', 'Stake');
	}

	async getAddresses(stakeAddress: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AddressDto>> {
		let address = '';
		try {
			address = Utils.decrypt(pageToken);
		} catch(err) {
			// throw new Error('Invalid cursor');
		}
		const addresses = await this.ledger.dbClient.getStakeAddresses(stakeAddress, size + 1, order, address);
		const [nextPageToken, items] = addresses.length <= size ? [null, addresses]: [Utils.encrypt(addresses[size - 1].address.toString()), addresses.slice(0, size)];
		const data = this.mapper.mapArray<Address, AddressDto>(items, 'AddressDto', 'Address');
		return { data: data, cursor: nextPageToken };

	}

	async coinSelection(stakeAddress: string, { value, max_input_count, check_min_utxo }: CoinSelectionDto): Promise<{selection: UtxoDto[], change?: ValueDto}> {
		let pageToken = '';
		const size = 1000;
		const order = 'desc';
		const utxos: Utxo[] = [];
		const config = this.configService.get<string>('NETWORK') != 'mainnet' ? Testnet : Mainnet;
		const requestedValue = new Value(value.lovelace, value.assets);
		const checkMinUtxo = check_min_utxo != undefined ? check_min_utxo : true;
		const maxInputCount = Math.min(max_input_count || Number.MAX_SAFE_INTEGER, MAX_TRANSACTION_INPUTS);
		let message = 'Not enough funds';
		let count = 0;
		do {
			const { data, cursor } = await this.getAddresses(stakeAddress, size, order, pageToken);
			pageToken = cursor;
			for (const { address } of data) {
				const outputs = await Utils.getAllUtxos(this.ledger.dbClient, address, 50, 'desc', 'hex');
				if (outputs.length == 0) {
					continue;
				}
				utxos.push(...outputs);
				try {
					const { selection, change } = Utils.coinSelection([...utxos], requestedValue, config, maxInputCount, checkMinUtxo);
					return { selection: this.mapper.mapArray<Utxo, UtxoDto>(selection, 'UtxoDto', 'Utxo'), change: this.mapper.map<Value, ValueDto>(change, 'ValueDto', 'Value') };
				} catch (err) {
					message = err.message;
				}
			}
		} while(pageToken)
		throw APIError.badRequest(message)
	}

	generateRecoveryPhrase(size: number, includeKey: boolean): {phrase: string[], key: string} {
		const result: {phrase: string[], key: string} = { phrase: [], key: ''};
		result.phrase = Seed.toMnemonicList(Seed.generateRecoveryPhrase(size));
		if (includeKey) {
			result.key = Seed.deriveRootKey(result.phrase).to_bech32();
		}
		return result;
	}

	// getRecoveryPhrase(key: string): string [] {
	// 	return Seed.toMnemonicList(Seed.getRecoveryPhrase(key));
	// }

	getRecoveryPhraseKey(phrase: string | string[]): string {
		return Seed.deriveRootKey(phrase).to_bech32();
	}

	async buildNativeScript(jsonScript: JsonScript): Promise<NativeScript> {
		let currentSlot = 0;
		if (jsonScript.lockTime && (jsonScript.type == ScriptTypeEnum.After || jsonScript.type == ScriptTypeEnum.Before)) {
			currentSlot = (await this.ledger.dbClient.getLatestBlock()).slot_no;
		}
		const script = Seed.buildPolicyScript(jsonScript, currentSlot); 
		const json = Seed.policyScriptToJson(script);
		const keys = Seed.getScriptKeys(script).map(k => k.to_bech32());
		return { script: json, keys };
	}

	getNativeScriptAddress(jsonScript: JsonScript, network: string): string {
		const script = Seed.buildPolicyScript(jsonScript);
		return Seed.getScriptAddress(script, network).to_bech32();
	}

}
