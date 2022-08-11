import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { webhookTypes } from '../models/webhook.model';
import * as cardanoAddresses from 'cardano-addresses';

const payment = webhookTypes.find(w => w == 'payment');

export function IsWebhookPaymentAddress(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsWebhookPaymentAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)['type'];
          if (relatedValue && relatedValue != payment) return true;
          return validAddress(value); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}

export function IsWebhookType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsWebhookType',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
            return typeof value === 'string' && webhookTypes.includes(value); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}

export async function validAddress(address: string): Promise<boolean> {
  try {
    await cardanoAddresses.inspectAddress(address);
    return true;
  } catch (err) {
    return false;
  }
}


export const webhookTypeMap = {
  'epoch': 'WBH_EPOCH',
  'block': 'WBH_BLOCK',
  'transaction': 'WBH_TRANSACTION',
  'delegation': 'WBH_DELEGATION',
  'asset': 'WBH_ASSET',
  'nft_api': 'WBH_NFT_API',
  'WBH_EPOCH': 'epoch',
  'WBH_BLOCK': 'block',
  'WBH_TRANSACTION': 'transaction',
  'WBH_DELEGATION': 'delegation',
  'WBH_ASSET': 'asset',
  'WBH_NFT_API': 'nft_api'
};

export const staticWebhookType = ['WBH_EPOCH', 'WBH_BLOCK', 'WBH_TRANSACTION', 'WBH_DELEGATION', 'WBH_ASSET', 'WBH_NFT_API'];