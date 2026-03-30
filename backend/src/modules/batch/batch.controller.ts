import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

import { BatchService } from './batch.service';
import { JoinBatchDto, BatchVoteDto } from '../../dto/batch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('batches')
@Controller('batches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('join')
  @ApiOperation({ summary: 'Join a voting batch' })
  @ApiResponse({ status: 200, description: 'Joined batch successfully' })
  async join(
    @CurrentUser('id') voterId: string,
    @Body() dto?: JoinBatchDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.batchService.join(voterId, dto);

    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/vote')
  @ApiOperation({ summary: 'Submit vote to batch' })
  @ApiResponse({ status: 200, description: 'Vote queued' })
  async submitVote(
    @Param('id') batchId: string,
    @CurrentUser('id') voterId: string,
    @Body() dto: BatchVoteDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.batchService.submitVote(voterId, batchId, dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get batch status' })
  @ApiResponse({ status: 200, description: 'Batch status' })
  async getStatus(
    @Param('id') batchId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.batchService.getStatus(batchId);

    return {
      success: true,
      data: result,
    };
  }

  @Post('heartbeat')
  @ApiOperation({ summary: 'Send heartbeat to keep batch position' })
  @ApiResponse({ status: 200, description: 'Heartbeat received' })
  async heartbeat(
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.batchService.heartbeat(voterId);

    return {
      success: true,
      data: result,
    };
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave current batch' })
  @ApiResponse({ status: 200, description: 'Left batch' })
  async leave(
    @Param('id') batchId: string,
    @CurrentUser('id') voterId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.batchService.leave(voterId, batchId);

    return {
      success: true,
      data: result,
    };
  }
}
