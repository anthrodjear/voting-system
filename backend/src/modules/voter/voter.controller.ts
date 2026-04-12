import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { VoterService } from './voter.service';
import { RegisterVoterDto, UpdateVoterDto, BiometricEnrollDto } from '../../dto/voter.dto';
import { UpdateProfileDto } from '../../dto/auth-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('voters')
@Controller('voters')
export class VoterController {
  constructor(private readonly voterService: VoterService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new voter' })
  @ApiResponse({ status: 201, description: 'Voter registered successfully' })
  @ApiResponse({ status: 409, description: 'Voter already exists' })
  async register(
    @Body() dto: RegisterVoterDto,
  ): Promise<{ success: boolean; data: { voterId: string; status: string; message: string } }> {
    const result = await this.voterService.register(dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin', 'ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter statistics' })
  @ApiResponse({ status: 200, description: 'Voter statistics' })
  async getStats(): Promise<{ success: boolean; data: any }> {
    const stats = await this.voterService.getStats();

    return {
      success: true,
      data: stats,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current voter profile' })
  @ApiResponse({ status: 200, description: 'Voter profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const voter = await this.voterService.findById(voterId);

    // Exclude sensitive fields from response
    const { passwordHash, passwordChangedAt, failedLoginAttempts, lockedAt, ...safeVoter } = voter;

    return {
      success: true,
      data: safeVoter,
    };
  }

  @Get('check-id/:nationalId')
  @ApiOperation({ summary: 'Check if National ID is available' })
  @ApiResponse({ status: 200, description: 'National ID availability' })
  async checkNationalId(
    @Param('nationalId') nationalId: string,
  ): Promise<{ success: boolean; data: { available: boolean } }> {
    try {
      await this.voterService.findByNationalId(nationalId);
      return {
        success: true,
        data: { available: false },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: true,
          data: { available: true },
        };
      }
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter information' })
  @ApiResponse({ status: 200, description: 'Voter information' })
  @ApiResponse({ status: 404, description: 'Voter not found' })
  async getVoter(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const voter = await this.voterService.findById(id);

    return {
      success: true,
      data: {
        voterId: voter.id,
        nationalId: voter.nationalId,
        firstName: voter.firstName,
        lastName: voter.lastName,
        county: voter.countyName,
        constituency: voter.constituencyName,
        status: voter.status,
        registeredAt: voter.registeredAt,
      },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update voter information' })
  @ApiResponse({ status: 200, description: 'Voter updated' })
  async updateVoter(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVoterDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: { voterId: string; updated: boolean } }> {
    const result = await this.voterService.update(id, dto, userId);

    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/biometrics/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enroll voter biometrics' })
  @ApiResponse({ status: 200, description: 'Biometrics enrolled' })
  async enrollBiometrics(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BiometricEnrollDto,
  ): Promise<{ success: boolean; data: { enrolled: boolean; faceEnrolled: boolean; fingerprintEnrolled: boolean } }> {
    const result = await this.voterService.enrollBiometrics(id, dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter verification status' })
  @ApiResponse({ status: 200, description: 'Voter status' })
  async getStatus(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voterService.getStatus(id);

    return {
      success: true,
      data: result,
    };
  }

  // ============================================================
  // NEW ENDPOINTS
  // ============================================================

  @Get('lookup-niif/:nationalId')
  @ApiOperation({ summary: 'Lookup voter in NIIF (National Integrated Identity Framework)' })
  @ApiResponse({ status: 200, description: 'NIIF lookup result' })
  async lookupNiif(
    @Param('nationalId') nationalId: string,
  ): Promise<{ success: boolean; data: any }> {
    // TODO: Integrate with actual NIIF API for real identity verification.
    // This is a stub that returns structured mock data for development/testing.
    // Production implementation should call the NIIF REST API with proper auth.
    const result = {
      found: true,
      nationalId,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'M' as const,
      dateOfBirth: '1990-01-15',
      county: 'Nairobi',
      constituency: 'Starehe',
      ward: 'Ngara',
    };

    return {
      success: true,
      data: result,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current voter profile (requires JWT auth)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser('id') voterId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voterService.update(voterId, dto as UpdateVoterDto, voterId);
    const voter = await this.voterService.findById(voterId);
    const { passwordHash, passwordChangedAt, failedLoginAttempts, lockedAt, ...safeVoter } = voter;

    return {
      success: true,
      data: safeVoter,
    };
  }

  @Get('elections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming elections available to the current voter' })
  @ApiResponse({ status: 200, description: 'List of upcoming elections for the voter' })
  async getMyElections(
    @CurrentUser('id') voterId: string,
  ): Promise<any[]> {
    // Get the voter to access their county
    const voter = await this.voterService.findById(voterId);
    if (!voter) {
      throw new NotFoundException('Voter not found');
    }

    const elections = await this.voterService.getUpcomingElections(voter.countyId);

    return elections;
  }
}
