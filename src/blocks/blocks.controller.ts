import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { Block, Transaction } from '@tango-crypto/tango-ledger';
import { PaginateResponse } from 'src/models/PaginateResponse';

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

	@Get(':blockNumber/transactions')
	getBlockTransactions(@Param('blockNumber') blockNumber: number, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<Transaction>> {
		return this.blocksService.getBlockTransactions(blockNumber, size, order, pageToken);
	}
}
