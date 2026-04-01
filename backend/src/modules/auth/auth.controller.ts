import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService, AuthTokens } from './auth.service';
import { LoginDto, RefreshTokenDto, MfaVerifyDto, LogoutDto } from '../../dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<{ success: boolean; data: AuthTokens }> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    const tokens = await this.authService.login(dto, ipAddress, userAgent);

    return {
      success: true,
      data: tokens,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ success: boolean; data: { accessToken: string; expiresIn: number } }> {
    const tokens = await this.authService.refreshToken(dto.refreshToken);

    return {
      success: true,
      data: tokens,
    };
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA challenge' })
  @ApiResponse({ status: 200, description: 'MFA verified' })
  @ApiResponse({ status: 401, description: 'MFA verification failed' })
  async verifyMfa(@Body() dto: MfaVerifyDto): Promise<{ success: boolean; data: { verified: boolean; sessionId: string } }> {
    const result = await this.authService.verifyMfa(dto);

    return {
      success: true,
      data: result,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() dto: LogoutDto,
  ): Promise<{ success: boolean; data: { message: string } }> {
    await this.authService.logout(userId, dto.sessionId);

    return {
      success: true,
      data: { message: 'Logged out successfully' },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(
    @CurrentUser('id') userId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const user = await this.authService.getUserById(userId, userType);

    return {
      success: true,
      data: user,
    };
  }
}
