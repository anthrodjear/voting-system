import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { RoService } from './ro.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('ro')
@Controller('ro')
export class RoController {
  constructor(private readonly roService: RoService) {}

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get RO dashboard statistics' })
  @ApiResponse({ status: 200, description: 'RO dashboard stats' })
  async getDashboardStats(
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const stats = await this.roService.getDashboardStats(roId);

    return {
      success: true,
      data: stats,
    };
  }

  @Get('pending-approvals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending approvals' })
  @ApiResponse({ status: 200, description: 'Pending approvals' })
  async getPendingApprovals(
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const approvals = await this.roService.getPendingApprovals(roId);

    return {
      success: true,
      data: approvals,
    };
  }

  @Get('voters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voters for RO county' })
  @ApiResponse({ status: 200, description: 'Voters list' })
  async getVoters(
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const voters = await this.roService.getVoters(roId);

    return {
      success: true,
      data: voters,
    };
  }

  @Post('voters/:id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a voter' })
  @ApiResponse({ status: 200, description: 'Voter verified' })
  async verifyVoter(
    @Param('id', ParseUUIDPipe) voterId: string,
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.roService.verifyVoter(voterId, roId);

    return {
      success: true,
      data: result,
    };
  }

  @Post('voters/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a voter' })
  @ApiResponse({ status: 200, description: 'Voter rejected' })
  async rejectVoter(
    @Param('id', ParseUUIDPipe) voterId: string,
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.roService.rejectVoter(voterId, roId);

    return {
      success: true,
      data: result,
    };
  }

  @Get('activity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity feed for RO county' })
  @ApiResponse({ status: 200, description: 'Activity feed' })
  async getActivity(
    @CurrentUser('id') roId: string,
    @CurrentUser('userType') userType: string,
  ): Promise<{ success: boolean; data: any }> {
    const activity = await this.roService.getActivity(roId);

    return {
      success: true,
      data: activity,
    };
  }
}