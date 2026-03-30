import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';
import { IsNationalId, IsKenyaPhone, IsStrongPassword } from '../common/decorators/custom-validators';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'National ID for voters, email for RO/Admin' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ enum: ['voter', 'ro', 'admin'] })
  @IsOptional()
  @IsEnum(['voter', 'ro', 'admin'])
  userType?: 'voter' | 'ro' | 'admin';
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class MfaVerifyDto {
  @ApiProperty({ description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: ['biometric', 'totp'] })
  @IsEnum(['biometric', 'totp'])
  mfaType: 'biometric' | 'totp';

  @ApiProperty({ description: 'MFA data (biometric templates or TOTP code)' })
  @IsNotEmpty()
  mfaData: {
    faceTemplate?: string;
    fingerprintTemplate?: string;
    totpCode?: string;
  };
}

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Session ID to logout' })
  @IsOptional()
  @IsString()
  sessionId?: string;
}
