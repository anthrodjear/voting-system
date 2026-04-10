import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';

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

  @Get('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get candidates for RO county' })
  @ApiResponse({ status: 200, description: 'Candidates list' })
  async getCandidates(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any }> {
    const candidates = await this.roService.getCandidates(roId);

    return {
      success: true,
      data: candidates,
    };
  }

  @Post('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new candidate for RO county' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        middleName: { type: 'string' },
        position: { type: 'string', enum: ['Governor', 'Senator', 'Women Rep', 'MP', 'MCA'] },
        partyName: { type: 'string' },
        partyAbbreviation: { type: 'string' },
        isIndependent: { type: 'boolean' },
        constituencyId: { type: 'string' },
        wardId: { type: 'string' },
      },
      required: ['firstName', 'lastName', 'position', 'partyName'],
    },
  })
  async createCandidate(
    @CurrentUser('id') roId: string,
    @Body() body: {
      firstName: string;
      lastName: string;
      middleName?: string;
      position: string;
      partyName: string;
      partyAbbreviation?: string;
      isIndependent?: boolean;
      constituencyId?: string;
      wardId?: string;
    },
  ): Promise<{ success: boolean; data: any }> {
    const candidate = await this.roService.createCandidate(roId, body);

    return {
      success: true,
      data: candidate,
    };
  }

  @Post('candidates/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate approved' })
  async approveCandidate(
    @Param('id', ParseUUIDPipe) candidateId: string,
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.roService.approveCandidate(candidateId, roId);

    return {
      success: true,
      data: result,
    };
  }

  @Post('candidates/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate rejected' })
  async rejectCandidate(
    @Param('id', ParseUUIDPipe) candidateId: string,
    @CurrentUser('id') roId: string,
    @Body('reason') reason: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.roService.rejectCandidate(candidateId, roId, reason);

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

  // ============================================================
  // NEW ENDPOINTS
  // ============================================================

  @Get('batches/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active batches' })
  @ApiResponse({ status: 200, description: 'Active batches' })
  async getActiveBatches(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any[] }> {
    const batches = await this.roService.getActiveBatches(roId);
    return { success: true, data: batches };
  }

  @Get('batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get batch details' })
  @ApiResponse({ status: 200, description: 'Batch details' })
  async getBatchDetails(
    @Param('id', ParseUUIDPipe) batchId: string,
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any }> {
    const batch = await this.roService.getBatchDetails(batchId, roId);
    return { success: true, data: batch };
  }

  @Post('batches/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Close a batch' })
  @ApiResponse({ status: 200, description: 'Batch closed' })
  async closeBatch(
    @Param('id', ParseUUIDPipe) batchId: string,
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: { closed: boolean; batchId: string } }> {
    const result = await this.roService.closeBatch(batchId, roId);
    return { success: true, data: result };
  }

  @Get('elections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get elections visible to RO' })
  @ApiResponse({ status: 200, description: 'Elections list' })
  async getElections(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any[] }> {
    const elections = await this.roService.getElections(roId);
    return { success: true, data: elections };
  }

  @Get('voters/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter statistics for RO county' })
  @ApiResponse({ status: 200, description: 'Voter statistics' })
  async getVoterStatistics(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any }> {
    const stats = await this.roService.getVoterStatistics(roId);
    return { success: true, data: stats };
  }

  @Get('voting/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voting statistics' })
  @ApiResponse({ status: 200, description: 'Voting statistics' })
  async getVotingStatistics(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any }> {
    const stats = await this.roService.getVotingStatistics(roId);
    return { success: true, data: stats };
  }

  @Get('voting-progress')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voting progress' })
  @ApiResponse({ status: 200, description: 'Voting progress' })
  async getVotingProgress(
    @CurrentUser('id') roId: string,
  ): Promise<{ success: boolean; data: any[] }> {
    const progress = await this.roService.getVotingProgress(roId);
    return { success: true, data: progress };
  }
}
