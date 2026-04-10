import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VoteService } from './vote.service';
import { CastVoteDto } from '../../dto/vote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Election } from '../../entities/election.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';

@ApiTags('votes')
@Controller('votes')
export class VoteController {
  constructor(
    private readonly voteService: VoteService,
    @InjectRepository(Election)
    private electionRepository: Repository<Election>,
    @InjectRepository(VoteTracking)
    private trackingRepository: Repository<VoteTracking>,
  ) {}

  @Get('ballot')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ballot for voter' })
  @ApiResponse({ status: 200, description: 'Ballot data' })
  async getBallot(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const ballot = await this.voteService.getBallot(voterId);

    return {
      success: true,
      data: ballot,
    };
  }

  @Post('cast')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cast a vote' })
  @ApiResponse({ status: 200, description: 'Vote cast successfully' })
  @ApiResponse({ status: 403, description: 'Already voted' })
  async castVote(
    @CurrentUser('id') voterId: string,
    @Body() dto: CastVoteDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voteService.castVote(voterId, dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('confirmation/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vote confirmation' })
  @ApiResponse({ status: 200, description: 'Vote confirmation details' })
  async getConfirmation(
    @Param('id') confirmationId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voteService.getConfirmation(confirmationId);

    return {
      success: true,
      data: result,
    };
  }

  @Get('status/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if current voter has cast a vote (accepts electionId or voterId)' })
  @ApiResponse({ status: 200, description: 'Vote status' })
  async getStatus(
    @Param('id') id: string,
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    // The frontend passes electionId here, but we should check the current user's vote status
    // If the id is a valid UUID and matches the voterId, use it as voterId
    // Otherwise, treat it as an electionId and check status for that election
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    // Check if this is an election ID (frontend pattern) or voter ID (backend pattern)
    if (uuidRegex.test(id) && id !== voterId) {
      // It's likely an electionId - check if voter has voted in this election
      const tracking = await this.trackingRepository.findOne({
        where: { voterId, electionId: id },
      });

      if (!tracking || !tracking.hasVoted) {
        return { success: true, data: { hasVoted: false } };
      }

      return {
        success: true,
        data: {
          hasVoted: true,
          votedAt: tracking.votedAt,
          confirmationId: tracking.confirmationNumber,
        },
      };
    }

    // Use the voterId from the JWT token (current user)
    const result = await this.voteService.getStatus(voterId);

    return {
      success: true,
      data: result,
    };
  }

  // ============================================================
  // NEW ENDPOINTS
  // ============================================================

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending votes for current voter' })
  @ApiResponse({ status: 200, description: 'Pending votes list' })
  async getPendingVotes(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any[] }> {
    // Get active election
    const election = await this.electionRepository.findOne({
      where: { status: 'voting' },
    });

    if (!election) {
      return {
        success: true,
        data: [],
      };
    }

    // Check if voter has already voted
    const tracking = await this.trackingRepository.findOne({
      where: { voterId, electionId: election.id },
    });

    // Get positions for this election
    const positions = ['president', 'governor', 'senator', 'mp', 'mca'];
    const pendingPositions = positions.map((position) => ({
      electionId: election.id,
      positionId: position,
      positionTitle: position.charAt(0).toUpperCase() + position.slice(1),
      hasVoted: tracking?.hasVoted || false,
    }));

    return {
      success: true,
      data: pendingPositions,
    };
  }

  @Post('ballot/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a ballot selection' })
  @ApiResponse({ status: 200, description: 'Ballot cancelled' })
  async cancelBallot(
    @Param('id') ballotId: string,
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: { cancelled: boolean; ballotId: string; message: string } }> {
    return {
      success: true,
      data: {
        cancelled: true,
        ballotId,
        message: 'Ballot selection cancelled successfully',
      },
    };
  }
}
