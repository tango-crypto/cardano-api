import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDetail } from 'src/models/AddressDetail';
import { Transaction, Utxo } from 'tango-ledger';
import { AddressesService } from './addresses.service';

@Controller(':accountId/addresses')
export class AddressesController {
	constructor(private readonly addressesService: AddressesService) {}

	@Get(':address')
	get(@Param('address') address: string): Promise<AddressDetail> {
		return this.addressesService.get(address);
	}

	@Get(':address/utxos')
	getUtxos(@Param('address') address: string): Promise<Utxo[]> {
		return this.addressesService.getUtxos(address);
	}

	@Get(':address/transactions')
	getTransactions(@Param('address') address: string, @Query('order') order: string): Promise<Transaction[]> {
		return this.addressesService.getTransactions(address, order);
	}
}
