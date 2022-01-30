import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Controller(':accountId/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async findAll(@Param('accountId') accountId: string, @Query('size') size: number, @Query('cursor') pageToken: string): Promise<PaginateResponse<WebhookDto>> {
    return this.webhooksService.findAll(accountId, size, pageToken);
  }

  @Get(':id')
  async findOne(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.webhooksService.findOne(accountId, id);
  }

  @Post()
  async create(@Param('accountId') accountId: string, @Body() webhook: CreateWebhookDto): Promise<WebhookDto> {
    return this.webhooksService.create(accountId, webhook);
  }

  @Patch(':id')
  async update(@Param('accountId') accountId: string, @Param('id') id: string, @Body() webhook: UpdateWebhookDto): Promise<WebhookDto> {
    return this.webhooksService.update(accountId, id, webhook);
  }

  @Delete(':id')
  async remove(@Param('accountId') accountId: string, @Param('id') id: string) {
    const deleted = await this.webhooksService.remove(accountId, id);
    return { deleted };
  }
}
