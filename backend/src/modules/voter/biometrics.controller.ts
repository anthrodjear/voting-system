import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { VoterService } from './voter.service';
import { BiometricEnrollDto } from '../../dto/voter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('voters')
@Controller('voters')
export class BiometricsController {
  constructor(private readonly voterService: VoterService) {}

  @Post('biometrics/enroll')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll biometrics for current voter' })
  @ApiResponse({ status: 200, description: 'Biometrics enrolled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enrollBiometrics(
    @CurrentUser('id') voterId: string,
    @Body() dto: BiometricEnrollDto,
  ): Promise<{ success: boolean; data: { enrolled: boolean; faceEnrolled: boolean; fingerprintEnrolled: boolean } }> {
    const result = await this.voterService.enrollBiometrics(voterId, dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('biometrics/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get biometric enrollment status for current voter' })
  @ApiResponse({ status: 200, description: 'Biometric enrollment status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBiometricStatus(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voterService.getStatus(voterId);

    return {
      success: true,
      data: {
        voterId: result.voterId,
        status: result.status,
        idVerified: result.idVerified,
        faceEnrolled: result.faceEnrolled,
        fingerprintEnrolled: result.fingerprintEnrolled,
        verifiedAt: result.verifiedAt,
      },
    };
  }
}
