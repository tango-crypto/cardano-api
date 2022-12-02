import { Controller, Get, Param, Query } from '@nestjs/common';
import { RedeemerDto } from 'src/models/dto/Redeemer.dto';
import { ScriptDto } from 'src/models/dto/Script.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { ScriptsService } from './scripts.service';

@Controller(':accountId/scripts')
export class ScriptsController {
    constructor(private readonly scriptsService: ScriptsService) {}

    @Get(':hash')
	getScript(@Param('hash') hash: string): Promise<ScriptDto> {
		return this.scriptsService.get(hash);
	}

    @Get(':hash/redeemers')
	getRedeemers(@Param('hash') hash: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<RedeemerDto>> {
		return this.scriptsService.getRedeemers(hash, Number(size), order, pageToken);
	}
}
