import { Controller, Get, Param } from '@nestjs/common';
import { AssetDto } from 'src/models/dto/Asset.dto';

import { AssetsService } from './assets.service';

@Controller(':accountId/assets')
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Get(':id')
	get(@Param('id') id: string): Promise<AssetDto> {
		return this.assetsService.get(id);
	}
}
