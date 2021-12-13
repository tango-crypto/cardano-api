import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Metadata, Transaction, Utxo } from '@tango-crypto/tango-ledger';
import { SubmitTxDto } from './dto/submitTx.dto';
import { SubmitTxResponseDto } from './dto/submitTxResponse.dto';
import { TransactionsService } from './transactions.service';

@Controller(':accountId/transactions')
export class TransactionsController {
	constructor(private readonly transactionsService: TransactionsService) {}

	@Get(':txHash')
	get(@Param('txHash') txHash: string): Promise<Transaction> {
		return this.transactionsService.get(txHash);
	}

	@Get(':txHash/utxos')
	getUtxos(@Param('txHash') txHash: string): Promise<{hash: string, inputs: Utxo[], outputs: Utxo[]}> {
		return this.transactionsService.getUtxos(txHash);
	}

	@Get(':txHash/metadata')
	getMetadata(@Param('txHash') txHash: string): Promise<Metadata[]> {
		return this.transactionsService.getMetadata(txHash);
	}

	@Post('submit')
	@HttpCode(200)
	async submit(@Param('accountId') userId: string, @Body() submitTx: SubmitTxDto): Promise<SubmitTxResponseDto> {
		let txId = await this.transactionsService.submit(userId, submitTx.tx);
		return { txId: txId };
	}
}
