import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that the value is a valid Kenyan National ID (8 digits)
 */
export function IsNationalId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          return /^[0-9]{8}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be exactly 8 digits`;
        },
      },
    });
  };
}

/**
 * Validates that the value is a valid Kenyan phone number (+254 format)
 */
export function IsKenyaPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // Accepts: +254712345678, 0712345678, 254712345678
          return /^(?:\+254|254|0)(?:1|7|11)[0-9]{8}$/.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Kenyan phone number`;
        },
      },
    });
  };
}

/**
 * Validates that password meets security requirements
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value,
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be at least 8 characters with uppercase, lowercase, number, and special character`;
        },
      },
    });
  };
}
