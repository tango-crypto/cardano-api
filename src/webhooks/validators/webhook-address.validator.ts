import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { webhookTypes } from '../models/webhook.model';

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
          return relatedValue != 'payment' || (typeof value === 'string' && value.startsWith('addr')); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}

