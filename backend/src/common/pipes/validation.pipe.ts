import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipeCustom implements PipeTransform<any> {
  constructor(
    private options?: {
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
      transform?: boolean;
      transformOptions?: any;
    },
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, this.options?.transformOptions);
    const errors = await validate(object, {
      whitelist: this.options?.whitelist ?? true,
      forbidNonWhitelisted: this.options?.forbidNonWhitelisted ?? true,
      transform: this.options?.transform ?? true,
    });

    if (errors.length > 0) {
      const messages = errors.map((err) => {
        const constraints = Object.values(err.constraints || {}).join(', ');
        return `${err.property}: ${constraints}`;
      });

      throw new BadRequestException({
        success: false,
        error: {
          code: 4000,
          message: 'Validation failed',
          details: messages,
        },
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
