import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { BlockDto } from 'src/models/dto/Block.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';

@Controller(':accountId/blocks')
export class BlocksController {
	constructor(private readonly blocksService: BlocksService) {}

	@Get(':blockNumber')
	get(@Param('blockNumber') blockNumber: number): Promise<BlockDto> {
		return this.blocksService.get(blockNumber);
	}

	@Get('/hash/:blockHash')
	getByHash(@Param('blockHash') blockHash: string): Promise<BlockDto> {
		return this.blocksService.getByHash(blockHash);
	}

	@Get('latest')
	getLatest(): Promise<BlockDto> {
		return this.blocksService.getLatest();
	}

	@Get(':blockNo/transactions')
	getBlockTransactions(@Param('blockNo') blockNumber: number, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.blocksService.getBlockTransactions(blockNumber, Number(size), order, pageToken);
	}

	@Get('/hash/:blockHash/transactions')
	getBlockTransactionsByHash(@Param('blockHash') blockHash: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<TransactionDto>> {
		return this.blocksService.getBlockTransactions(blockHash, Number(size), order, pageToken);
	}
}
