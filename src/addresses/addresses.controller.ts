import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDetail } from 'src/models/AddressDetail';
import { Asset, Transaction, Utxo } from '@tango-crypto/tango-ledger';
import { AddressesService } from './addresses.service';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Controller(':accountId/addresses')
export class AddressesController {
	constructor(private readonly addressesService: AddressesService) {}

	@Get(':address')
	get(@Param('address') address: string): Promise<AddressDetail> {
		return this.addressesService.get(address);
	}

	@Get(':address/utxos')
	getUtxos(@Param('address') address: string, @Query('size') size: number, @Query('order') order: string, @Query('pageToken') pageToken: string): Promise<PaginateResponse<Utxo>> {
		return this.addressesService.getUtxos(address, size, order, pageToken);
	}

	@Get(':address/assets')
	getAssets(@Param('address') address: string): Promise<Asset[]> {
		return this.addressesService.getAssets(address);
	}

	@Get(':address/transactions')
	getTransactions(@Param('address') address: string, @Query('size') size: number, @Query('order') order: string, @Query('pageToken') pageToken: string): Promise<PaginateResponse<Transaction>> {
		return this.addressesService.getTransactions(address, size, order, pageToken);
	}
}
