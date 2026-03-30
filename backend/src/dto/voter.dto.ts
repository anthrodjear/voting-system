import { PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import {
  IsNationalId,
  IsKenyaPhone,
  IsStrongPassword,
} from '../common/decorators/custom-validators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterVoterDto {
  @ApiProperty({ description: 'Kenyan National ID (8 digits)', example: '12345678' })
  @IsNationalId()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ example: 'Kasarani' })
  @IsOptional()
  @IsString()
  constituency?: string;

  @ApiPropertyOptional({ example: 'Mwiki' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiProperty({ example: '+254712345678' })
  @IsKenyaPhone()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'john.doe@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class UpdateVoterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsKenyaPhone()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  constituency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ward?: string;
}

export class BiometricEnrollDto {
  @ApiProperty({ description: 'Base64 encoded face image' })
  @IsString()
  @IsNotEmpty()
  faceImage: string;

  @ApiProperty({ description: 'Liveness proof token' })
  @IsString()
  @IsNotEmpty()
  faceLivenessToken: string;

  @ApiProperty({ description: 'Fingerprint templates' })
  @IsNotEmpty()
  fingerprintImages: {
    leftThumb: string;
    rightThumb: string;
  };
}

export class VoterStatusResponseDto {
  @ApiProperty()
  voterId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  idVerified: boolean;

  @ApiProperty()
  faceEnrolled: boolean;

  @ApiProperty()
  fingerprintEnrolled: boolean;

  @ApiPropertyOptional()
  verifiedAt?: Date;
}
