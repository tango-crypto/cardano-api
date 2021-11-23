import { Injectable } from '@nestjs/common';
import { APIError } from 'src/common/errors';
import { DynamoDBClient, PutItemCommand, QueryCommand, DeleteItemCommand, UpdateItemCommand, PutItemCommandInput, AttributeValue } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { ConfigService } from '@nestjs/config';
import { Webhook } from './models/webhook.model';
import { Utils } from 'src/utils';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { WebhookDto } from './dto/webhook.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/types';

const client = new DynamoDBClient({ region: "us-west-1", credentials: fromIni({profile: 'tangocrypto'}) })

@Injectable()
export class WebhooksService {
    constructor(
        private readonly configService: ConfigService,
        @InjectMapper() private mapper: Mapper
    ){}

    async findAll(userId: string): Promise<WebhookDto[]> {
      const input = {
        TableName: process.env.DYNAMO_DB_ACCOUNT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
        ExpressionAttributeValues: {':pk': {S: `Account#${userId}`}, ':sk': {S: 'WBH#'}}
      };
      const command = new QueryCommand(input);
      const response = await client.send(command);
      const items = response.Items || [];
      return this.mapper.mapArray(items.map(item =>  Utils.dynanoDBOutputFormat(item)), WebhookDto, Webhook);
    }

    async findOne(userId: string, id: string): Promise<WebhookDto> {
      const input = {
        TableName: process.env.DYNAMO_DB_ACCOUNT_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {':pk': {S: `Account#${userId}`}, ':sk': {S: `WBH#${id}`}}
      };
      const command = new QueryCommand(input);
      const response = await client.send(command);
      if (response.Items && response.Items.length > 0) {
        return  this.mapper.map(Utils.dynanoDBOutputFormat(response.Items[0]), WebhookDto, Webhook);
      } else {
        throw APIError.notFound(`webhook for id: ${id} and userId: ${userId}`);
      }
    }

    async update(userId: string, id: string, webhook: Webhook): Promise<boolean> {
      await this.findOne(userId, id);
      let { UpdateExpression, ExpressionAttributeValues, ExpressionAttributeNames } = Utils.dynamoDBUpdateExpression(webhook);
      const time = Date.now().toString();
      UpdateExpression += ", update_date = :update_date";
      ExpressionAttributeValues[':update_date'] = {N: time};
      const updateInput = {
        TableName: this.configService.get<string>("DYNAMO_DB_ACCOUNT_TABLE_NAME"),
        Key: {
          PK: {S: `Account#${userId}`},
          SK: {S: `WBH#${id}`}
        },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames
        // UpdateExpression: "SET #name = :name, network = :network, description = :description, callback_url = :callback_url, #rules = :rules, update_date = :update_date, available = :available",
        // ExpressionAttributeValues: { 
        //   ":name": {S: webhook.name},
        //   ":network": {S: webhook.network},
        //   ":description": {S: webhook.description},
        //   ":callback_url": {S: webhook.callback_url},
        //   ":rules": Utils.dynamoDBInputFormat(webhook.rules),
        //   ":update_date": {N: time},
        //   ":available": {S: webhook.available}
        // },
        // ExpressionAttributeNames: {
        //   "#name": "name",
        //   "#rules": "rules"
        // }
      };
      let command = new UpdateItemCommand(updateInput);
      await client.send(command);
      return true;
    }

    async create(userId: string, webhook: Webhook): Promise<WebhookDto> {
      try {
        const time = Date.now().toString();
        const id = uuidv4().replace(/-/g, ''); 
        const webhookAttributes: {[key: string]: AttributeValue} = {
          id: {S: id},
          name: {S: webhook.name},
          network: {S: this.configService.get<string>("NETWORK")},
          description: {S: webhook.description || ''},
          webhook_type: {S: webhook.webhook_type},
          auth_token: {S: webhook.auth_token},
          callback_url: {S: webhook.callback_url},
          last_trigger_date: {N: webhook.last_trigger_date},
          rules: Utils.dynamoDBInputFormat(webhook.rules),
          create_date: {N: time},
          update_date: {N: time},
          type: {S: webhook.type},
          available: {S: webhook.available}
        };
        const params: PutItemCommandInput = {
          TableName: this.configService.get<string>("DYNAMO_DB_ACCOUNT_TABLE_NAME"),
          Item: {...webhookAttributes, PK: {S: `Account#${userId}`}, SK: {S: `WBH#${id}`}}
        }
        const command = new PutItemCommand(params);
        await client.send(command);
        return Utils.dynanoDBOutputFormat(webhookAttributes);
      } catch (err) {
        throw APIError.badRequest(err.message);
      }
  }

  async remove(userId: string, id: string): Promise<boolean> {
    await this.findOne(userId, id);
    const params = {
			TableName: this.configService.get<string>("DYNAMO_DB_ACCOUNT_TABLE_NAME"),
			Key: {
				PK: {S: `Account#${userId}`},
				SK: {S: `WBH#${id}`}
			}
		};
		const command = new DeleteItemCommand(params);
		await client.send(command);
    return true;
  }

}
