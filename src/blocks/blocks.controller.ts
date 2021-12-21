import { Controller, Get, Param } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { Block, Transaction } from '@tango-crypto/tango-ledger';

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

	@Get(':blockId/transactions')
	getBlockTransactions(@Param('blockId') blockId: number): Promise<Transaction[]> {
		return this.blocksService.getBlockTransactions(blockId);
	}
}
