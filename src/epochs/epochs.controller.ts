import { Controller, Get, Param } from '@nestjs/common';
import { EpochParameters } from 'tango-ledger';
import { EpochsService } from './epochs.service';

@Controller(':accountId/epochs')
export class EpochsController {
	constructor(private readonly epochsService: EpochsService) {}

	@Get(':epoch/parameters')
	getParamters(@Param('epoch') epoch: number): Promise<EpochParameters> {
		return this.epochsService.getParameters(epoch);
	}
}
