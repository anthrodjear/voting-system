# Validation Middleware

## Overview

This document details data validation middleware.

---

## 1. Request Validation

```typescript
// pipes/validation.pipe.ts
@Injectable()
export class ValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = validateSync(object);

    if (errors.length > 0) {
      const messages = errors.map(err => 
        `${err.property}: ${Object.values(err.constraints).join(', ')}`
      );
      throw new BadRequestException(messages);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

---

## 2. Custom Validators

```typescript
// decorators/custom-validators.ts
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

// National ID Validator
export function IsNationalId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return /^[0-9]{8}$/.test(value);
        },
        defaultMessage() {
          return 'National ID must be 8 digits';
        }
      }
    });
  };
}

// Phone Number Validator
export function IsKenyaPhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return /^\+254[1-9][0-9]{8}$/.test(value);
        },
        defaultMessage() {
          return 'Invalid Kenya phone number';
        }
      }
    });
  };
}
```
