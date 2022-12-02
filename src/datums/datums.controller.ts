import { Controller, Get, Param } from '@nestjs/common';
import { DatumDto } from 'src/models/dto/Datum.dto';
import { DatumsService } from './datums.service';

@Controller(':accountId/datums')
export class DatumsController {
    constructor(private readonly datumsService: DatumsService) {}

    @Get(':hash')
	getDatum(@Param('hash') hash: string): Promise<DatumDto> {
		return this.datumsService.get(hash);
	}
}
