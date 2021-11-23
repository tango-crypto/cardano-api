import { Controller, Get, Param } from '@nestjs/common';
import { Asset } from 'tango-ledger';

import { AssetsService } from './assets.service';

@Controller(':accountId/assets')
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@Get(':id')
	get(@Param('id') id: string): Promise<Asset> {
		return this.assetsService.get(id);
	}
}
