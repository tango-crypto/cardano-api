import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { MapPipe } from '@automapper/nestjs';
import { Webhook } from './models/webhook.model';
import { WebhookDto } from './dto/webhook.dto';

@Controller(':accountId/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  async create(@Param('accountId') userId: string, @Body(MapPipe(Webhook, CreateWebhookDto)) webhook: Webhook): Promise<WebhookDto> {
    return this.webhooksService.create(userId, webhook);
  }

  @Get()
  async findAll(@Param('accountId') userId: string) {
    return this.webhooksService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('accountId') userId: string, @Param('id') id: string) {
    return this.webhooksService.findOne(userId, id);
  }

  @Patch(':id')
  async update(@Param('accountId') userId: string, @Param('id') id: string, @Body(MapPipe(Webhook, UpdateWebhookDto)) webhook: Webhook) {
    const updated = await this.webhooksService.update(userId, id, webhook);
    return { updated };
  }

  @Delete(':id')
  async remove(@Param('accountId') userId: string, @Param('id') id: string) {
    const deleted = await this.webhooksService.remove(userId, id);
    return { deleted };
  }
}
