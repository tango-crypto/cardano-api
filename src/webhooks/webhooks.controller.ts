import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Headers } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Controller(':accountId/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  async findAll(@Headers('x-api-key') accountId: string, @Query('size') size: number = 50, @Query('cursor') pageToken: string): Promise<PaginateResponse<WebhookDto>> {
    return this.webhooksService.findAll(accountId, Number(size), pageToken);
  }

  @Get(':id')
  async findOne(@Headers('x-api-key') accountId: string, @Param('id') id: string) {
    return this.webhooksService.findOne(accountId, id);
  }

  @Post()
  async create(@Headers('x-api-key') accountId: string, @Body() webhook: CreateWebhookDto): Promise<WebhookDto> {
    return this.webhooksService.create(accountId, webhook);
  }

  @Patch(':id')
  async update(@Headers('x-api-key') accountId: string, @Param('id') id: string, @Body() webhook: UpdateWebhookDto): Promise<WebhookDto> {
    return this.webhooksService.update(accountId, id, webhook);
  }

  @Delete(':id')
  async remove(@Headers('x-api-key') accountId: string, @Param('id') id: string): Promise<{deleted: boolean, deleted_webhook_id: string, deleted_at: string}> {
    const deleted = await this.webhooksService.remove(accountId, id);
    return { deleted, deleted_webhook_id: id, deleted_at: new Date().toISOString() };
  }
}
