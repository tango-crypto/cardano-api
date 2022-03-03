import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressDto } from 'src/models/dto/Address.dto';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';

import { AssetsService } from './assets.service';

@Controller(':accountId/assets')
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Get(':id')
	get(@Param('id') id: string): Promise<AssetDto> {
		return this.assetsService.get(id);
	}

	@Get(':id/addresses')
	getAddresses(@Param('id') id: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AddressDto>> {
		return this.assetsService.getAddresses(id, Number(size), order, pageToken);
	}
}
