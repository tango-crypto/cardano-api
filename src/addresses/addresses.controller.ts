import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDetailDto } from 'src/models/dto/AddressDetail.dto';
import { AddressesService } from './addresses.service';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { Utxo } from '@tango-crypto/tango-ledger';
import { InspectAddress } from 'cardano-addresses';

@Controller(':accountId/addresses')
export class AddressesController {
	constructor(private readonly addressesService: AddressesService) {}

	@Get(':address')
	get(@Param('address') address: string): Promise<AddressDetailDto> {
		return this.addressesService.get(address);
	}

	@Get(':address/utxos')
	getUtxos(@Param('address') address: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<UtxoDto>> {
		return this.addressesService.getUtxos(address, Number(size), order, pageToken);
	}

	@Get(':address/assets')
	getAssets(@Param('address') address: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AssetDto>> {
		return this.addressesService.getAssets(address, Number(size), order, pageToken);
	}

	@Get(':address/assets/:asset/utxos')
	getAssetUtxos(@Param('address') address: string, @Param('asset') asset: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<Utxo>> {
		return this.addressesService.getAssetUtxos(address, asset, Number(size), order, pageToken);
	}

	@Get(':address/transactions')
	getTransactions(@Param('address') address: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.addressesService.getTransactions(address, Number(size), order, pageToken);
	}

	@Get(':address/info')
	getRawInfo(@Param('address') address: string): Promise<InspectAddress> {
		return this.addressesService.rawInfo(address);
	}
}
