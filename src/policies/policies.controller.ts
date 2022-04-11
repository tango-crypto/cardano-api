import { Controller, Get, Param, Query } from '@nestjs/common';
import { AssetDto } from 'src/models/dto/Asset.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';
import { PoliciesService } from './policies.service';

@Controller(':accountId/policies')
export class PoliciesController {
    constructor(private readonly policiesService: PoliciesService) {}

    @Get(':policy/assets')
    getAssets(@Param('policy') policyId: string, @Query('size') size: number = 50, @Query('order') order: string, @Query('cursor') pageToken: string): Promise<PaginateResponse<AssetDto>> {
        return this.policiesService.getAssets(policyId, Number(size), order, pageToken);
    }
}
