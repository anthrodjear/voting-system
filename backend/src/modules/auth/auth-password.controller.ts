import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  UpdateProfileDto,
} from '../../dto/auth-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthPasswordController {
  private readonly logger = new Logger(AuthPasswordController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userType: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.changePassword(userId, userType, dto.currentPassword, dto.newPassword);

    return {
      success: true,
      data: { message: 'Password changed successfully' },
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset via email' })
  @ApiResponse({ status: 200, description: 'Reset email sent' })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.forgotPassword(dto.email);

    return {
      success: true,
      data: { message: 'If an account with that email exists, a password reset link has been sent.' },
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);

    return {
      success: true,
      data: { message: 'Password reset successfully' },
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.verifyEmail(dto.token);

    return {
      success: true,
      data: { message: 'Email verified successfully' },
    };
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  async resendVerification(
    @Body() dto: ResendVerificationDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.resendVerification(dto.email);

    return {
      success: true,
      data: { message: 'Verification email sent' },
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userType: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ success: boolean; data: any }> {
    const updated = await this.authService.updateProfile(userId, userType, dto);

    return {
      success: true,
      data: updated,
    };
  }
}
