import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { MapPipe } from '@automapper/nestjs';
import { Webhook } from './models/webhook.model';
import { WebhookDto } from './dto/webhook.dto';
import { PaginateResponse } from 'src/models/PaginateResponse';

@Controller(':accountId/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async create(@Param('accountId') accountId: string, @Body(MapPipe(Webhook, CreateWebhookDto)) webhook: Webhook): Promise<WebhookDto> {
    return this.webhooksService.create(accountId, webhook);
  }

  @Get()
  async findAll(@Param('accountId') accountId: string): Promise<PaginateResponse<WebhookDto>> {
    return this.webhooksService.findAll(accountId);
  }

  @Get(':id')
  async findOne(@Param('accountId') accountId: string, @Param('id') id: string) {
    return this.webhooksService.findOne(accountId, id);
  }

  @Patch(':id')
  async update(@Param('accountId') accountId: string, @Param('id') id: string, @Body(MapPipe(Webhook, UpdateWebhookDto)) webhook: Webhook) {
    const updated = await this.webhooksService.update(accountId, id, webhook);
    return { updated };
  }

  @Delete(':id')
  async remove(@Param('accountId') accountId: string, @Param('id') id: string) {
    const deleted = await this.webhooksService.remove(accountId, id);
    return { deleted };
  }
}
