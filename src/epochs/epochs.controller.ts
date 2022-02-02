import { Controller, Get, Param } from '@nestjs/common';
import { EpochDto } from 'src/models/dto/Epoch.dto';
import { EpochParametersDto } from 'src/models/dto/EpochParameters.dto';
import { EpochsService } from './epochs.service';

@Controller(':accountId/epochs')
export class EpochsController {
	constructor(private readonly epochsService: EpochsService) {}

	@Get('current')
	getLatest(): Promise<EpochDto> {
		return this.epochsService.getLatest();
	}

	@Get(':epoch/parameters')
	getParamters(@Param('epoch') epoch: number): Promise<EpochParametersDto> {
		return this.epochsService.getParameters(epoch);
	}
}
