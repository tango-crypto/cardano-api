import { Body, Controller, Get, HttpCode, Param, Post, Query, Headers } from '@nestjs/common';
import { MetadataDto } from 'src/models/dto/Metadata.dto';
import { TransactionDto } from 'src/models/dto/Transaction.dto';
import { UtxoDto } from 'src/models/dto/Utxo.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { BuildTxDto } from './dto/buildTx.dto';
import { BuildTxResponseDto } from './dto/buildTxResponse.dto';
import { SubmitTxDto } from './dto/submitTx.dto';
import { SubmitTxResponseDto } from './dto/submitTxResponse.dto';
import { TransactionsService } from './transactions.service';

@Controller(':accountId/transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Get(':txHash')
	get(@Param('txHash') txHash: string): Promise<TransactionDto> {
		return this.transactionsService.get(txHash);
	}

	@Get(':txHash/utxos')
	getUtxos(@Param('txHash') txHash: string): Promise<{hash: string, inputs: UtxoDto[], outputs: UtxoDto[]}> {
		return this.transactionsService.getUtxos(txHash);
	}

	@Get(':txHash/metadata')
	getMetadata(@Param('txHash') txHash: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<MetadataDto>> {
		return this.transactionsService.getMetadata(txHash, Number(size), order, pageToken);
	}

	@Post('submit')
	@HttpCode(200)
	async submit(@Headers('x-api-key') accountId: string, @Body() submitTx: SubmitTxDto): Promise<SubmitTxResponseDto> {
		const txId = await this.transactionsService.submit(accountId, submitTx.tx);
		return { tx_id: txId };
	}

	@Post('build')
	@HttpCode(200)
	async buildTx(@Headers('x-api-key') accountId: string, @Body() payload: BuildTxDto): Promise<BuildTxResponseDto> {
		return this.transactionsService.buildTx(accountId, payload);
	}
}
