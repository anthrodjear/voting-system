import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { VoteService } from './vote.service';
import { CastVoteDto } from '../../dto/vote.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('votes')
@Controller('votes')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

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

  @Get('status/:voterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if voter has cast a vote' })
  @ApiResponse({ status: 200, description: 'Vote status' })
  async getStatus(
    @Param('voterId', ParseUUIDPipe) voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.voteService.getStatus(voterId);

    return {
      success: true,
      data: result,
    };
  }
}
