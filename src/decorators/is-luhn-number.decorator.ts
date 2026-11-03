import { ValidateBy, type ValidationOptions } from 'class-validator';
import { passesLuhnCheck } from '../payments/luhn.js';

export function IsLuhnNumber(options?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isLuhnNumber',
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && passesLuhnCheck(value),
        defaultMessage: () => '$property must be a valid card number',
      },
    },
    options,
  );
}
