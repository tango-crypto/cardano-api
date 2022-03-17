import { Address, AuxiliaryData, BigNum, Bip32PrivateKey, hash_auxiliary_data, hash_transaction, LinearFee, make_vkey_witness, min_fee, NativeScript, NativeScripts, PrivateKey, Transaction, TransactionBody, TransactionHash, TransactionOutput, TransactionOutputs, TransactionUnspentOutput, TransactionWitnessSet, Value, Vkey, Vkeywitness, Vkeywitnesses } from "@emurgo/cardano-serialization-lib-nodejs";
import { Asset } from "./asset.model";
import { Seed } from "../serialization.util";
import { CoinSelectionChange } from "./coin-selection-change.model";
import { Payment } from "./payment.model";

export class MultisigTransaction {
    utxos: TransactionUnspentOutput[];
    outputs: Payment[];
    change: CoinSelectionChange[];
    txBody: TransactionBody;
    txHash: TransactionHash;
    vkeyWitnesses: Vkeywitnesses;
    nativeScripts: NativeScripts;
    transaction: Transaction;
    numberOfWitnesses: number;
    config: any;
    encoding: BufferEncoding;
    metadata: AuxiliaryData;
    assets: Asset[];

    constructor(
        utxos: TransactionUnspentOutput[],
        outputs: Payment[],
        change: CoinSelectionChange[],
        txBody: TransactionBody, 
        scripts: NativeScript[], 
        privateKeys: PrivateKey[], 
        numberOfWitnesses: number, 
        config: any, 
        encoding: BufferEncoding, 
        metadata?: AuxiliaryData, 
        assets?: Asset[]) {
        this.utxos = utxos;
        this.outputs = outputs;
        this.change = change;
        
        // this.transaction = this.buildTx(txBody, scripts, privateKeys, metadata);
        this.config = config;
        this.encoding = encoding;
        this.metadata = metadata;
        this.assets = assets;

        this.vkeyWitnesses = Vkeywitnesses.new();
        this.nativeScripts = NativeScripts.new();

        scripts.forEach(s => {
            this.nativeScripts.add(s);
        });
        this.numberOfWitnesses = numberOfWitnesses;

        this.txBody = this.adjustFee(txBody);
        this.txHash = hash_transaction(this.txBody);

        privateKeys.forEach(prvKey => {
            // add keyhash witnesses
            const vkeyWitness = make_vkey_witness(this.txHash, prvKey);
            this.vkeyWitnesses.add(vkeyWitness);
        });


    }

    addKeyWitnesses(...privateKeys: PrivateKey[]): void {
        privateKeys.forEach(prvKey => {
            // add keyhash witnesses
            const vkeyWitness = make_vkey_witness(this.txHash, prvKey);
            this.vkeyWitnesses.add(vkeyWitness);
        });
	}

	addScriptWitness(...scripts: NativeScript[]): void {
        scripts.forEach(s => {
            this.nativeScripts.add(s);
        });
	}

    adjustFee(txBody: TransactionBody): TransactionBody {
        const tx = this.fakeTx(txBody);
        const txFee = this.txFee(tx);
        const bodyFee = parseInt(txBody.fee().to_str());

        console.log(`Fees: initial = ${bodyFee}, adjusted = ${txFee}`);
        if (txFee < bodyFee) {
            const feeDiff = bodyFee - txFee;
            const feeDiffPerChange = Math.ceil(feeDiff/this.change.length);
			this.change = this.change.map(c => {
				c.amount.quantity += feeDiffPerChange;
				return c;
			});

            const outputs = this.outputs.map(output => {
				let address = Address.from_bech32(output.address);
				let amount = Value.new(
					BigNum.from_str(output.amount.quantity.toString())
				);
	
				// add tx assets
				if(output.assets && output.assets.length > 0){
					let multiAsset = Seed.buildMultiAssets(output.assets, this.encoding);
					amount.set_multiasset(multiAsset);
				}
	
				return TransactionOutput.new(
					address,
					amount
				);
			});

            outputs.push(...this.change.map(change => {
				let address = Address.from_bech32(change.address);
				let amount = Value.new(
					BigNum.from_str(change.amount.quantity.toString())
				);
	
				// add tx assets
				if(change.assets && change.assets.length > 0){
					let multiAsset = Seed.buildMultiAssets(change.assets, this.encoding);
					amount.set_multiasset(multiAsset);
				}
	
				return TransactionOutput.new(
					address,
					amount
				);
			}));

            const txOutputs = TransactionOutputs.new();
			outputs.forEach(txout => txOutputs.add(txout));
            console.log('Final outputs:', JSON.stringify(this.outputs, null, 2));
            console.log('Final change:', this.change);
            const body = TransactionBody.new(txBody.inputs(), txOutputs, BigNum.from_str(txFee.toString()), txBody.ttl());

            // metadata
            if (this.metadata) {
                const dataHash = hash_auxiliary_data(this.metadata);
                body.set_auxiliary_data_hash(dataHash);
            }
            // mint tokens
            if (this.assets) {
                const mint = Seed.buildTransactionMint(this.assets, this.encoding);
                body.set_mint(mint);
            }

            // set tx validity start interval
		    body.set_validity_start_interval(txBody.validity_start_interval());
            return body;

            // this.transaction = Transaction.new(body, this.transaction.witness_set(), this.transaction.auxiliary_data());
        } else {
            return txBody;
        }
    }

    build(): string {
        const witnesses = TransactionWitnessSet.new();
        witnesses.set_vkeys(this.vkeyWitnesses);
		if (this.nativeScripts.len() > 0) {
			witnesses.set_native_scripts(this.nativeScripts);
		}
        
		const tx = Transaction.new(
			this.txBody,
			witnesses,
			this.metadata
		);
        return Buffer.from(tx.to_bytes()).toString('hex');
    }

    private txFee(tx: Transaction) {
        return parseInt(min_fee(tx, LinearFee.new(BigNum.from_str(this.config.protocols.txFeePerByte.toString()), BigNum.from_str(this.config.protocols.txFeeFixed.toString()))).to_str());
    }

    private fakeTx(txBody: TransactionBody) {
        const fakeWitnesses = Vkeywitnesses.new();
        const fakeKey = this.fakePrivateKey();
        const rawKey = fakeKey.to_raw_key();
        // const txHash = hash_transaction(txBody);
        const fakeVkeyWitness = Vkeywitness.new(
            Vkey.new(rawKey.to_public()),
            // rawKey.sign(txHash.to_bytes())
            rawKey.sign(Buffer.from([...Array(100).keys()]))
        );
        for (let i = 0; i < this.numberOfWitnesses; i++) {
            fakeWitnesses.add(fakeVkeyWitness);
        }

        const witnessSet = TransactionWitnessSet.new();
        witnessSet.set_vkeys(fakeWitnesses);
        if (this.nativeScripts.len() > 0) {
            witnessSet.set_native_scripts(this.nativeScripts);
        }

        const cloneMetadata = AuxiliaryData.from_bytes(this.metadata.to_bytes());
        const tx = Transaction.new(
            txBody,
            witnessSet,
            cloneMetadata
        );
        return tx;
    }

    private fakePrivateKey(): Bip32PrivateKey {
        return Bip32PrivateKey.from_bytes(
            Buffer.from([0xb8, 0xf2, 0xbe, 0xce, 0x9b, 0xdf, 0xe2, 0xb0, 0x28, 0x2f, 0x5b, 0xad, 0x70, 0x55, 0x62, 0xac, 0x99, 0x6e, 0xfb, 0x6a, 0xf9, 0x6b, 0x64, 0x8f,
                0x44, 0x45, 0xec, 0x44, 0xf4, 0x7a, 0xd9, 0x5c, 0x10, 0xe3, 0xd7, 0x2f, 0x26, 0xed, 0x07, 0x54, 0x22, 0xa3, 0x6e, 0xd8, 0x58, 0x5c, 0x74, 0x5a,
                0x0e, 0x11, 0x50, 0xbc, 0xce, 0xba, 0x23, 0x57, 0xd0, 0x58, 0x63, 0x69, 0x91, 0xf3, 0x8a, 0x37, 0x91, 0xe2, 0x48, 0xde, 0x50, 0x9c, 0x07, 0x0d,
                0x81, 0x2a, 0xb2, 0xfd, 0xa5, 0x78, 0x60, 0xac, 0x87, 0x6b, 0xc4, 0x89, 0x19, 0x2c, 0x1e, 0xf4, 0xce, 0x25, 0x3c, 0x19, 0x7e, 0xe2, 0x19, 0xa4]
            )
        );
    }

}