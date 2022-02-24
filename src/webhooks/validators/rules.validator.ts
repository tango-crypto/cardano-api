import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { ruleFieldTypes, operatorMapping } from '../models/rule.model';

const fields = Object.keys(ruleFieldTypes);

export function IsValidField(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsValidField',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return fields.includes(value); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}

export function IsValidOperator(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
        name: 'IsValidOperator',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [],
        options: validationOptions,
        validator: {
            validate(value: any, args: ValidationArguments) {
                const field = (args.object as any)['field'];
                const operatorType = ruleFieldTypes[field];
                if (!operatorType) return false;
                const operators = operatorMapping[operatorType];
                return operators && operators.includes(value); // you can return a Promise<boolean> here as well, if you want to make async validation
            },
        },
        });
    };
}
export function IsValidValue(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
        name: 'IsValidValue',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [],
        options: validationOptions,
        validator: {
            validate(value: any, args: ValidationArguments) {
                const field = (args.object as any)['field'];
                const operatorType = ruleFieldTypes[field];
                if (!operatorType) return false;
                switch (operatorType) {
                    case 'string':
                        return typeof value == 'string';
                    case 'number':
                        return !Number.isNaN(Number(value));
                    default:
                        return false;
                }
            },
        },
        });
    };
}