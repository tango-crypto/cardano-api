import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AddressDto } from 'src/models/dto/Address.dto';
import { CreateRecoveryPhrase } from 'src/models/dto/CreateRecoveryPhrase.dto';
import { NativeScript } from 'src/models/dto/NativeScript.dto';
import { RecoveryPhrase } from 'src/models/dto/RecoveryPhrase.dto';
import { StakeDto } from 'src/models/dto/Stake.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { JsonScript } from 'src/utils/models/json-script.model';
import { StakesService } from './stakes.service';

@Controller(':accountId/wallets')
export class WalletsController {
	constructor(private readonly stakesService: StakesService) {}

	@Get(':stake_address')
	getStake(@Param('stake_address') stakeAddress: string): Promise<StakeDto> {
		return this.stakesService.get(stakeAddress);
	}

	@Get(':stake_address/addresses')
	getStakeAddresses(@Param('stake_address') stakeAddress: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AddressDto>> {
		return this.stakesService.getAddresses(stakeAddress, Number(size), order, pageToken);
	}

	@Post('recovery_phrase')
	generatetRecoveryPhrase(@Body() input: CreateRecoveryPhrase): RecoveryPhrase {
		return this.stakesService.generateRecoveryPhrase(input.size, input.includeKey);
	}

	@Post('recovery_phrase/key')
	getRecoveryPhraseKey(@Body() recovery: RecoveryPhrase): string {
		return this.stakesService.getRecoveryPhraseKey(recovery.phrase);
	}

	@Post('native_script')
	buildNativeScript(@Body() jsonScript: JsonScript): Promise<NativeScript> {
		return this.stakesService.buildNativeScript(jsonScript);
	}

	@Post('native_script/address')
	getNativeScriptAddress(@Body() jsonScript: JsonScript, @Query('network') network = 'mainnet'): string {
		return this.stakesService.getNativeScriptAddress(jsonScript, network);
	}
}
