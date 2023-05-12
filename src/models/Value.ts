import { Asset, Utxo } from '@tango-crypto/tango-ledger';

export class Value {
    coin: number;
    assets: Map<string, Asset>;

    static fromUtxo(utxo: Utxo) {
        return new Value(Number(utxo.value), utxo.assets);
    }

    constructor(coin?: number, assets?: Asset[]) {
        this.coin = coin || 0;
        this.assets = assets ? assets.reduce((map, asset) => {
            const unit = asset.policy_id + asset.asset_name;
            if (!map.has(unit)) {
                map.set(unit, {...asset, quantity: Number(asset.quantity)});
            } else {
                map.get(unit).quantity += Number(asset.quantity);
            }
            return map;
        }, new Map<string, Asset>()) : new Map<string, Asset>()
    }

    addAda(coin: number) {
        this.coin += coin;
    }

    add(other: Value) {
        this.coin += other.coin
        for (const [key, asset] of other.assets.entries()) {
            if (this.assets.has(key)) {
                this.assets.get(key).quantity += asset.quantity;
            } else {
                this.assets.set(key, asset);
            }
        }
        return this;
    }

    sub(other: Value) {
        this.coin = Math.max(this.coin - other.coin, 0);
        for (const [key, asset] of other.assets.entries()) {
            if (this.assets.has(key)) {
                this.assets.get(key).quantity -= asset.quantity;
                if (this.assets.get(key).quantity <= 0) {
                    this.assets.delete(key);
                }
            }
        }
        return this;
    }

    isEmpty(): boolean {
        return this.coin == 0 && this.assets.size == 0;
    }

    isAdaOnly(): boolean {
        return this.assets.size == 0;
    }

    isAssetOnly(): boolean {
        return this.coin == 0 && this.assets.size > 0;
    }

    isFulfilled(other: Value): boolean {
        return this.isCoinFulfilled(other) && this.isAssetFulfilled(other);
    }

    isCoinFulfilled(other: Value): boolean {
        return this.coin >= other.coin;
    }

    isAssetFulfilled(other: Value): boolean {
        return [...other.assets.entries()].every(([key, asset]) => this.assets.get(key)?.quantity >= asset.quantity);
    }

    containsAsset(other: Value): boolean {
        return [...other.assets.keys()].some(key => this.assets.has(key));
    }

    clone(): Value {
        const clone = new Value(this.coin);
        clone.assets = new Map([...this.assets.entries()].map(([key, asset]) => [key, {...asset}]));
        return clone;
    }

}