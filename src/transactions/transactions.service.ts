import { AssetName, hash_transaction, make_vkey_witness, NativeScript, PrivateKey, ScriptHash, Transaction as SerializeTransaction } from '@emurgo/cardano-serialization-lib-nodejs';
import { Injectable } from '@nestjs/common';
import { Utils } from 'src/common/utils';
import { APIError } from 'src/common/errors';
import { TangoLedgerService } from 'src/providers/tango-ledger/tango-ledger.service';
import { Metadata, Transaction, Utxo, Script as LedgerScript } from '@tangocrypto/tango-ledger';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { Mapper } from '@automapper/types';
import { InjectMapper } from '@automapper/nestjs';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { MetadataDto } from 'src/models/dto/Metadata.dto';
import { BuildTxDto } from './dto/buildTx.dto';
import { CoinSelection } from 'src/utils/models/coin-selection.model';
import { Mainnet, Testnet } from 'src/utils/config/network.config';
import { Asset } from 'src/utils/models/asset.model';
import { Seed } from 'src/utils/serialization.util';
import { AmountUnitEnum } from 'src/utils/models/amount-unit-enum.model';
import * as _ from 'lodash';
import { MeteringService } from 'src/providers/metering/metering.service';
import { Script } from 'src/utils/models/script.model';
import { ScriptDto } from 'src/models/dto/Script.dto';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { EvaluateTxResponseDto } from './dto/evaluateTxResponse.dto'
import { OgmiosService } from 'src/providers/ogmios/ogmios.service';
import { OgmiosUtxoDto, Redeemer, TxInDto, TxOutDto } from './dto/evaluateTx.dto';
import { TxIn, TxOut, Utxo as OgmiosUtxo } from '@cardano-ogmios/schema';
import { EvaluationResult } from '@cardano-ogmios/client/dist/TxSubmission';


@Injectable()
export class TransactionsService {
	businessAddress: string;
	policyId: string;
	policyScript: Script;
	policyScriptKey: string;
	scriptKeys: PrivateKey[];
	policyScriptHash: ScriptHash;
	assetName: AssetName;
	network: string;
	ogmiosPort: number;

	constructor(
		private readonly ledger: TangoLedgerService,
		private readonly configService: ConfigService,
		private readonly meteringService: MeteringService,
		private readonly ogmiosService: OgmiosService,
		@InjectMapper('pojo-mapper') private mapper: Mapper
	) {

		this.network = this.configService.get<string>('NETWORK') || 'mainnet';
		this.ogmiosPort = this.configService.get<number>('OGMIOS_PORT') || 3337;

	}

	async get(txHash: string): Promise<TransactionDto> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		let tx = await this.ledger.dbClient.getTransaction(txHash);
		if (!tx) {
			throw APIError.notFound(`transaction: ${txHash}`);
		}
		const data = this.mapper.map<Transaction, TransactionDto>(tx, 'Transaction', 'TransactionDto');
		return data;
	}

	async getUtxos(txHash: string): Promise<{ hash: string, inputs: UtxoDto[], outputs: UtxoDto[] }> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		const { hash, inputs, outputs } = await this.ledger.dbClient.getTransactionUtxosFull(txHash);
		const inputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(inputs, 'Utxo', 'UtxoDto');
		const outputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(outputs, 'Utxo', 'UtxoDto');
		return { hash, inputs: inputUtxos, outputs: outputUtxos };
	}

	async getCollaterals(txHash: string): Promise<{ hash: string, inputs: UtxoDto[], outputs: UtxoDto[] }> {
		// Utils.checkDataBaseConnection(dbClient); // check if not connected before call db
		const { hash, inputs, outputs } = await this.ledger.dbClient.getTransactionCollaterals(txHash);
		const inputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(inputs, 'Utxo', 'UtxoDto');
		const outputUtxos = this.mapper.mapArray<Utxo, UtxoDto>(outputs, 'Utxo', 'UtxoDto');
		return { hash, inputs: inputUtxos, outputs: outputUtxos };
	}

	async getMints(txHash: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<AssetDto>> {
		let identifier = '';
		try {
			identifier = Utils.decrypt(pageToken);
		} catch (err) {
			// throw new Error('Invalid cursor');
		}
		const assets = await this.ledger.dbClient.getTransactionMints(txHash, size + 1, order, identifier);
		const data = this.mapper.mapArray<Asset, AssetDto>(assets, 'Asset', 'AssetDto');
		const [nextPageToken, items] = data.length <= size ? [null, data] : [Utils.encrypt(data[size - 1].fingerprint), data.slice(0, size)];
		return { data: items, cursor: nextPageToken };
	}

	async getScripts(txHash: string): Promise<ScriptDto[]> {
		const scripts = await this.ledger.dbClient.getTransactionScripts(txHash);
		return this.mapper.mapArray<LedgerScript, ScriptDto>(scripts, 'Script', 'ScriptDto');
	}

	async getMetadata(txHash: string, size: number = 50, order: string = 'desc', pageToken = ''): Promise<PaginateResponse<MetadataDto>> {
		let key = -1;
		try {
			const decr = Utils.decrypt(pageToken);
			const number = decr ? Number(decr) : Number.NaN;
			key = !Number.isNaN(number) ? number : -1;
		} catch (err) {
			// throw new Error('Invalid cursor');
		}
		const metadata = await this.ledger.dbClient.getTransactionMetadata(txHash, size + 1, order, key);
		const data = this.mapper.mapArray<Metadata, MetadataDto>(metadata, 'Metadata', 'MetadataDto');
		const [nextPageToken, items] = data.length <= size ? [null, data] : [Utils.encrypt(data[size - 1].label), data.slice(0, size)];
		return { data: items, cursor: nextPageToken };
	}

	async submit(userId: string, cborHex: string): Promise<string> {

		try {
			const txId = await this.ogmiosService.submitTx(cborHex);
			return txId;
		} catch (err) {
			let errorMessage = err.isAxiosError && err.response && err.response.data ? err.response.data : err.message;
			throw APIError.badRequest(errorMessage || err);
		}
	}

	async buildTx(accountId: string, { inputs, outputs, burnouts, recipients, minting_keys, minting_script, change_address }: BuildTxDto): Promise<{ tx: string, tx_id: string }> {
		const config = this.configService.get<string>('NETWORK') != 'mainnet' ? Testnet : Mainnet;
		const assets: Asset[] = [];
		const scripts: NativeScript[] = [];
		const signingKeys: PrivateKey[] = [];
		const coinSelection: CoinSelection = {
			inputs: inputs.map(i => ({
				id: i.hash,
				index: i.index,
				address: i.address,
				amount: {
					quantity: i.value,
					unit: AmountUnitEnum.Lovelace
				},
				assets: i.assets
			})),
			outputs: outputs?.map(o => ({
				address: o.address,
				amount: {
					quantity: o.value,
					unit: AmountUnitEnum.Lovelace
				},
				assets: o.assets
			})) || [],
			change: []
		};

		let txMetadata = {};
		let ttl = Number.MAX_SAFE_INTEGER;
		let total = 0;
		let spendableTotal = 0;
		let outputCosts = (outputs || []).reduce((acc, o) => acc + o.value, 0);

		if (burnouts?.assets) {
			assets.push(...burnouts.assets);
		}
		if (burnouts?.keys) {
			signingKeys.push(...burnouts.keys.map(key => Seed.getPrivateKey(key)));
		}
		if (burnouts?.scripts) {
			// add scripts
			for (const script of burnouts.scripts) {
				ttl = Math.min(Seed.findScriptExpireSlot(script) || Number.MAX_SAFE_INTEGER, ttl);
				const burnScript = Seed.buildPolicyScript(script, 0);
				if (burnScript.root) {
					scripts.push(burnScript.root);
				}
			}
		}

		// include inputs assets into outputs and get how much usable money actually is
		for (let i = 0; i < inputs.length; i++) {
			const input = inputs[i];
			const assets = input.assets;
			const amount = input.value;
			total += amount;
			if (!assets || assets.length == 0) {
				spendableTotal += amount;
				continue;
			}
			const inputAssets: Asset[] = [];
			// get all input assets and add only those not been burn
			for (let { policy_id, asset_name, quantity } of assets) {
				const burn = burnouts?.assets?.find(a => a.policy_id == policy_id && a.asset_name == asset_name)?.quantity || 0;
				const r = quantity + burn;
				if (r > 0) {
					inputAssets.push({
						policy_id: policy_id,
						asset_name: Buffer.from(asset_name).toString('hex'),
						quantity: r
					})
				}
			}

			// add previuos tokens utxo
			const minAda = Seed.getMinUtxoValueWithAssets(input.address, inputAssets, null, null, config, 'hex');
			spendableTotal += amount - minAda;
			coinSelection.outputs.push({
				address: input.address,
				amount: {
					quantity: minAda,
					unit: AmountUnitEnum.Lovelace,
				},
				assets: inputAssets,
			});
		}

		// add minting tokens
		if (minting_script) {
			ttl = Math.min(Seed.findScriptExpireSlot(minting_script) || Number.MAX_SAFE_INTEGER, ttl);

			// add keys
			signingKeys.push(...(minting_keys || []).map(key => Seed.getPrivateKey(key)));

			// add scripts
			const script = Seed.buildPolicyScript(minting_script, 0);
			if (script.root) {
				scripts.push(script.root);
			}

			// add assets
			let mints = 0;
			for (let [recipient, tokens] of Object.entries(recipients)) {
				const mintTokens = [];

				// add assets & metadata
				for (const t of tokens) {
					mintTokens.push({
						policy_id: t.policy_id,
						asset_name: Buffer.from(t.asset_name).toString('hex'),
						quantity: t.quantity,
					});

					if (t.metadata) {
						txMetadata = _.merge(txMetadata, t.metadata);
					}
				}

				mints += mintTokens.length;
				assets.push(...mintTokens);

				const minAda = Seed.getMinUtxoValueWithAssets(recipient, mintTokens, null, null, config, 'hex');
				outputCosts += minAda;

				// add recipient output tokens
				coinSelection.outputs.push({
					address: recipient,
					amount: {
						quantity: minAda,
						unit: AmountUnitEnum.Lovelace,
					},
					assets: mintTokens,
				});
			}

			// add comission
			const { fee: comission } = await this.meteringService.getNftFee(accountId);
			if (comission) {
				const trackingAsset = {
					policy_id: this.policyId,
					asset_name: Buffer.from(this.assetName.name()).toString('hex'),
					quantity: mints
				};

				scripts.push(this.policyScript.root);
				signingKeys.push(this.scriptKeys[0]);
				assets.push(trackingAsset);

				outputCosts += comission;
				coinSelection.outputs.push({
					address: this.businessAddress,
					amount: {
						quantity: comission,
						unit: AmountUnitEnum.Lovelace,
					},
					assets: [trackingAsset]
				})
			}
		}

		const changes = spendableTotal - outputCosts;

		// send back any remaining funds
		if (change_address && changes > 0) {
			coinSelection.change.push({
				address: change_address,
				amount: {
					quantity: changes,
					unit: AmountUnitEnum.Lovelace,
				}
			});
		} else if (changes < 0) {
			throw APIError.badRequest(`not enough funds`);
		}

		try {
			const multisigTx = Seed.buildTransactionMultisig(total, coinSelection, ttl, scripts, assets, signingKeys, { data: Object.keys(txMetadata).length > 0 ? txMetadata : null, config });

			const hash = multisigTx.getHash();

			// console.log('Selection:', JSON.stringify(multisigTx.getCoinSelection(), null, 2));
			return { tx_id: hash, tx: multisigTx.build() };
		} catch (err) {
			throw APIError.badRequest(err.message);
		}
	}

	async evaluateTx(cborHex: string, utxos?: UtxoDto[]): Promise<EvaluateTxResponseDto> {
		try {
			const mapUtxos = utxos ? this.mapUtxo(utxos) : undefined;
			const evaluationResult = await this.ogmiosService.evaluateTx(cborHex, mapUtxos);
			return this.mapEvaluateTx(evaluationResult);
		} catch (err) {
			console.log('ERROR', err.response.data);
			
			let errorMessage = err.isAxiosError && err.response?.data?.error ? err.response.data.error.data.reason : err.message;
			throw APIError.badRequest(errorMessage || err);
		}
	}

	convert(text: string, encoding: BufferEncoding = 'utf8', decoding: BufferEncoding = 'hex') {
		try {
			return Buffer.from(text, encoding).toString(decoding);
		} catch (err) {
			return text;
		}
	}
	
	plutusTypeKey(type: string): string {
		return type == 'plutusV2' ? 'plutus:v2' : 'plutus:v1';
	}
	
	nativeScript(json: any): any {
		return this.innerNativeScript(json);
	}
	
	innerNativeScript(script: any): any {
		switch (script.type) {
			case 'sig':
				return { clause: "signature", from: script.keyHash };
			case 'any':
				return { clause: "any", from: script.scripts.map((s: any) => this.innerNativeScript(s)) }
			case 'all':
				return { clause: "all", from: script.scripts.map((s: any) => this.innerNativeScript(s)) }
			case 'atLeast':
				return { clause: "some", atLeast: script.require, from: script.scripts.map((s: any) => this.innerNativeScript(s)) }
			case 'before':
				return { clause: "before", slot: script.slot }
			case 'after':
				return { clause: "after", slot: script.slot }
			default:
				return null;
		}
	}

	mapUtxo(data: UtxoDto[]): any {
		return data.map(({ hash, index, address, value, assets, datum, script }) => {
			const result: any = {
				transaction: {id: hash},
				index: index,
				address: address,
				value: {
					ada: {
						lovelace: value
					}
				}
			}
			if (assets) {
				result.value = { ...result.value, ...assets.reduce((dict, asset) => {
					if (!dict[asset.policy_id]) {
						dict[asset.policy_id] = {};
					}
					const key = this.convert(asset.asset_name);
					dict[asset.policy_id][key] = (dict[asset.policy_id][key] || 0) + Number(asset.quantity);
					return dict;
				}, {}) }
			}
			if (datum) {
				result.datumHash = datum.hash;
				result.datum = datum.value || datum.value_raw;
			}
			if (script) {
				
				const scriptType = script.type;
				result.script = scriptType == 'timelock' ? {
					language: "native",
					json: this.nativeScript(script.json),
					cbor: script.code
				} : { [this.plutusTypeKey(scriptType)]: script.code };
			}
			return result;
		})
	}

	mapEvaluateTx(evaluation: any[]): EvaluateTxResponseDto {
		return { redeemers: evaluation.map(({validator, budget}) => {
			const redeemer: Redeemer = {
				purpose: validator.purpose,
				index: validator.index,
				unit_mem: budget.memory,
				unit_cpu: budget.cpu
			}
			return redeemer;
		}) }
	}

	deserialize(cborHex: string): { txId: string, txCborHex: string, mintQuantity: number } {
		const tx = SerializeTransaction.from_bytes(Buffer.from(cborHex, 'hex'));
		const txBody = tx.body();
		const assets = txBody.mint()?.get(this.policyScriptHash);
		if (!!assets) { // api mint
			const mintQuantity = Number(assets.get(this.assetName).to_str());
			const witnessSet = tx.witness_set();
			const data = tx.auxiliary_data();
			const vkeys = witnessSet.vkeys();
			const txHash = hash_transaction(txBody);
			const vkeyWitness = make_vkey_witness(txHash, this.scriptKeys[this.scriptKeys.length - 1]); // add last sign key
			vkeys.add(vkeyWitness);
			witnessSet.set_vkeys(vkeys);
			const tx1 = SerializeTransaction.new(
				txBody,
				witnessSet,
				data
			);
			return { txId: Seed.getTxId(tx1), txCborHex: Buffer.from(tx1.to_bytes()).toString('hex'), mintQuantity }
		} else {
			return { txId: Seed.getFixedTxId(cborHex), txCborHex: cborHex, mintQuantity: 0 }
		}
	}
}
