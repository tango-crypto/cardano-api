import { Address, BaseAddress, RewardAddress } from "@emurgo/cardano-serialization-lib-nodejs";
import { AddressInfo } from "src/models/AddressInfo";

export class Utils {
	static getAddressInfo(address: string): AddressInfo {
		let addr = Address.from_bech32(address);
		let stakeCredential = BaseAddress.from_address(addr).stake_cred();
		let reward = RewardAddress.new(addr.network_id(), stakeCredential);
		return { network: addr.network_id() === 1 ? 'mainnet' : 'testnet', stake_address: reward.to_address().to_bech32()};
	}
}