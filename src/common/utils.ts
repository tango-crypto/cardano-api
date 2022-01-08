import * as crypto from 'crypto';
const algorithm = 'aes-256-ctr';
const secretKey = 'v1VH6sdmpNWjRRIqCc7gdxt01lwHzfr6';
const iv = Buffer.from('33f0e92dd0fda4efca202216ef0f0b27', 'hex');

import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-nodejs";
import { AddressInfo } from "src/models/AddressInfo";
export class Utils {
	static getAddressInfo(address: string): AddressInfo {
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