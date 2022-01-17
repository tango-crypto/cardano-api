import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { webhookTypes } from '../models/webhook.model';

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

