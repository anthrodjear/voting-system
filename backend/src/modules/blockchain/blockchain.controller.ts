/**
 * Blockchain Controller
 * 
 * NestJS controller for blockchain admin operations and event subscriptions.
 * Provides endpoints for election state management, candidate management,
 * and real-time event subscriptions.
 */

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiProperty } from '@nestjs/swagger';

import { BlockchainService, ElectionState } from '../../services/blockchain.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

class SetElectionStateDto {
  @ApiProperty({ description: 'Election state to set', enum: ['not_started', 'registration', 'voting', 'tallying', 'completed'] })
  state: ElectionState;
}

class AddCandidateDto {
  @ApiProperty({ description: 'Unique candidate identifier' })
  candidateId: string;

  @ApiProperty({ description: 'Encrypted initial vote count' })
  encryptedCount: string;

  @ApiProperty({ description: 'ZK proof for initialization' })
  proof: string;
}

class PublishResultsDto {
  @ApiProperty({ description: 'Encrypted election results' })
  encryptedResults: string;

  @ApiProperty({ description: 'ZK proof for results' })
  proof: string;
}

class SubscribeEventsDto {
  @ApiProperty({ description: 'Event type to subscribe to', enum: ['VoteCast', 'StateChanged', 'ResultsPublished'] })
  eventType: 'VoteCast' | 'StateChanged' | 'ResultsPublished';

  @ApiProperty({ description: 'Callback URL or identifier for the subscription' })
  callbackUrl?: string;
}

class EventCallbackDto {
  @ApiProperty({ description: 'Event payload' })
  eventType: string;

  @ApiProperty({ description: 'Event data' })
  data: any;

  @ApiProperty({ description: 'Transaction hash' })
  transactionHash?: string;

  @ApiProperty({ description: 'Block number' })
  blockNumber?: number;

  @ApiProperty({ description: 'Timestamp' })
  timestamp?: number;
}

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  /**
   * Set election state (admin only)
   * POST /blockchain/election/state
   */
  @Post('election/state')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set election state (admin only)' })
  @ApiResponse({ status: 200, description: 'Election state updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid state or blockchain not ready' })
  async setElectionState(
    @Body() dto: SetElectionStateDto,
  ): Promise<{ success: boolean; message: string; state: string }> {
    await this.blockchainService.setElectionState(dto.state);
    return {
      success: true,
      message: `Election state set to: ${dto.state}`,
      state: dto.state,
    };
  }

  /**
   * Add candidate to election (admin only)
   * POST /blockchain/candidates
   */
  @Post('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add candidate to election (admin only)' })
  @ApiResponse({ status: 201, description: 'Candidate added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid candidate data' })
  async addCandidate(
    @Body() dto: AddCandidateDto,
  ): Promise<{ success: boolean; message: string; candidateId: string }> {
    await this.blockchainService.addCandidate(dto.candidateId, dto.encryptedCount, dto.proof);
    return {
      success: true,
      message: `Candidate ${dto.candidateId} added successfully`,
      candidateId: dto.candidateId,
    };
  }

  /**
   * Publish election results (admin only)
   * POST /blockchain/results/publish
   */
  @Post('results/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish election results (admin only)' })
  @ApiResponse({ status: 200, description: 'Results published successfully' })
  @ApiResponse({ status: 400, description: 'Cannot publish results in current state' })
  async publishResults(
    @Body() dto: PublishResultsDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.blockchainService.publishResults(dto.encryptedResults, dto.proof);
    return {
      success: true,
      message: 'Election results published successfully',
    };
  }

  /**
   * Emergency pause the election (admin only)
   * POST /blockchain/pause
   */
  @Post('pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Emergency pause the election (admin only)' })
  @ApiResponse({ status: 200, description: 'Election paused successfully' })
  @ApiResponse({ status: 400, description: 'Cannot pause election' })
  async emergencyPause(): Promise<{ success: boolean; message: string }> {
    await this.blockchainService.emergencyPause();
    return {
      success: true,
      message: 'Election emergency paused',
    };
  }

  /**
   * Emergency unpause the election (admin only)
   * POST /blockchain/unpause
   */
  @Post('unpause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Emergency unpause the election (admin only)' })
  @ApiResponse({ status: 200, description: 'Election unpaused successfully' })
  @ApiResponse({ description: 'Cannot unpause election' })
  async emergencyUnpause(): Promise<{ success: boolean; message: string }> {
    await this.blockchainService.emergencyUnpause();
    return {
      success: true,
      message: 'Election emergency unpaused',
    };
  }

  /**
   * Subscribe to blockchain events (with JWT auth)
   * POST /blockchain/subscribe/events
   */
  @Post('subscribe/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'observer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to blockchain events' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid event type' })
  async subscribeToEvents(
    @Body() dto: SubscribeEventsDto,
  ): Promise<{ success: boolean; subscriptionId: string; eventType: string }> {
    const subscriptionId = await this.blockchainService.subscribeToEvents(
      dto.eventType,
      (data: any) => {
        // Default callback handler - in production would send to callbackUrl
        console.log(`Event received: ${dto.eventType}`, data);
      },
    );

    return {
      success: true,
      subscriptionId,
      eventType: dto.eventType,
    };
  }

  /**
   * Unsubscribe from events
   * POST /blockchain/unsubscribe/events
   */
  @Post('unsubscribe/events')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'observer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from blockchain events' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  async unsubscribeEvents(
    @Body() body: { subscriptionId: string },
  ): Promise<{ success: boolean; message: string }> {
    await this.blockchainService.unsubscribe(body.subscriptionId);
    return {
      success: true,
      message: `Unsubscribed from events: ${body.subscriptionId}`,
    };
  }

  /**
   * Get active subscriptions
   * GET /blockchain/subscriptions
   */
  @Get('subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'observer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active event subscriptions' })
  @ApiResponse({ status: 200, description: 'List of active subscriptions' })
  async getSubscriptions(): Promise<{ success: boolean; subscriptions: any[] }> {
    const subscriptions = this.blockchainService.getActiveSubscriptions();
    return {
      success: true,
      subscriptions,
    };
  }

  /**
   * Get blockchain service status
   * GET /blockchain/status
   */
  @Get('status')
  @ApiOperation({ summary: 'Get blockchain service status' })
  @ApiResponse({ status: 200, description: 'Service status' })
  async getStatus(): Promise<{
    success: boolean;
    ready: boolean;
    serviceAccountSecure: boolean;
    transactionConfig: { retries: number; confirmations: number };
  }> {
    return {
      success: true,
      ready: this.blockchainService.isReady(),
      serviceAccountSecure: this.blockchainService.isServiceAccountSecure(),
      transactionConfig: this.blockchainService.getTransactionConfig(),
    };
  }
}