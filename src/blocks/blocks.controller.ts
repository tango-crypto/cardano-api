import { Controller, Get, Param } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { Block } from 'tango-ledger';

@Controller(':accountId/blocks')
export class BlocksController {
	constructor(private readonly blocksService: BlocksService) {}

	@Get(':blockHashOrNumber')
	get(@Param('blockHashOrNumber') blockHashOrNumber: string | number): Promise<Block> {
		return this.blocksService.get(blockHashOrNumber);
	}

	@Get('latest')
	getLatest(): Promise<Block> {
		return this.blocksService.getLatest();
	}
}
