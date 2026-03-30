import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { ReportingService } from './reporting.service';
import { ElectionResultsQueryDto, TurnoutQueryDto } from '../../dto/reporting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @Get('results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get election results' })
  @ApiQuery({ name: 'level', required: false, enum: ['national', 'county', 'constituency'] })
  @ApiQuery({ name: 'position', required: false })
  @ApiQuery({ name: 'electionId', required: false })
  @ApiResponse({ status: 200, description: 'Election results' })
  async getElectionResults(
    @Query() query: ElectionResultsQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.reportingService.getElectionResults(query);

    return {
      success: true,
      data: result,
    };
  }

  @Get('turnout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter turnout statistics' })
  @ApiQuery({ name: 'electionId', required: false })
  @ApiQuery({ name: 'county', required: false })
  @ApiResponse({ status: 200, description: 'Turnout statistics' })
  async getTurnout(
    @Query() query: TurnoutQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.reportingService.getTurnout(query);

    return {
      success: true,
      data: result,
    };
  }

  @Get('audit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit report' })
  @ApiResponse({ status: 200, description: 'Audit report' })
  async getAuditReport(): Promise<{ success: boolean; data: any }> {
    const result = await this.reportingService.getAuditReport();

    return {
      success: true,
      data: result,
    };
  }

  @Get('blockchain/status')
  @ApiOperation({ summary: 'Get blockchain network status' })
  @ApiResponse({ status: 200, description: 'Blockchain status' })
  async getBlockchainStatus(): Promise<{ success: boolean; data: any }> {
    const result = await this.reportingService.getBlockchainStatus();

    return {
      success: true,
      data: result,
    };
  }
}
