import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDetailDto } from 'src/models/dto/AddressDetail.dto';
import { AddressesService } from './addresses.service';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';

@Controller(':accountId/addresses')
export class AddressesController {
	constructor(private readonly addressesService: AddressesService) {}

	@Get(':address')
	get(@Param('address') address: string): Promise<AddressDetailDto> {
		return this.addressesService.get(address);
	}

	@Get(':address/utxos')
	getUtxos(@Param('address') address: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<UtxoDto>> {
		return this.addressesService.getUtxos(address, size, order, pageToken);
	}

	@Get(':address/assets')
	getAssets(@Param('address') address: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AssetDto>> {
		return this.addressesService.getAssets(address, size, order, pageToken);
	}

	@Get(':address/transactions')
	getTransactions(@Param('address') address: string, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.addressesService.getTransactions(address, size, order, pageToken);
	}
}
