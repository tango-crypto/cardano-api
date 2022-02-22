import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { BlockDto } from 'src/models/dto/Block.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';

@Controller(':accountId/blocks')
export class BlocksController {
	constructor(private readonly blocksService: BlocksService) {}

	@Get(':blockHashOrNumber')
	get(@Param('blockHashOrNumber') blockHashOrNumber: string | number): Promise<BlockDto> {
		return this.blocksService.get(blockHashOrNumber);
	}

	@Get('latest')
	getLatest(): Promise<BlockDto> {
		return this.blocksService.getLatest();
	}

	@Get(':blockNumber/transactions')
	getBlockTransactions(@Param('blockNumber') blockNumber: number, @Query('size') size: number, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.blocksService.getBlockTransactions(blockNumber, Number(size), order, pageToken);
	}
}
