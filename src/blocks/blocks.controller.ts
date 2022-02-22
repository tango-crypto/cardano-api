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

	@Get(':blockHashOrNumber/transactions')
	getBlockTransactions(@Param('blockHashOrNumber') blockHashOrNumber: number | string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.blocksService.getBlockTransactions(blockHashOrNumber, Number(size), order, pageToken);
	}
}
