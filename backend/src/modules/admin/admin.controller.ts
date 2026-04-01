import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { AdminService } from './admin.service';
import {
  CreateCountyDto,
  RoApplicationDto,
  ReviewRoApplicationDto,
  RoApplicationQueryDto,
  CreatePresidentialCandidateDto,
} from '../../dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // County Management
  @Post('counties')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new county' })
  @ApiResponse({ status: 201, description: 'County created' })
  async createCounty(
    @Body() dto: CreateCountyDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const county = await this.adminService.createCounty(dto, userId);

    return {
      success: true,
      data: county,
    };
  }

  @Get('counties')
  @ApiOperation({ summary: 'List all counties' })
  @ApiResponse({ status: 200, description: 'Counties list' })
  async findAllCounties(): Promise<{ success: boolean; data: any }> {
    const counties = await this.adminService.findAllCounties();

    return {
      success: true,
      data: counties,
    };
  }

  // RO Applications
  @Post('ro/applications')
  @ApiOperation({ summary: 'Submit RO application' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async submitRoApplication(
    @Body() dto: RoApplicationDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.submitRoApplication(dto);

    return {
      success: true,
      data: result,
    };
  }

  @Get('ro/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List RO applications' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'county', required: false })
  @ApiResponse({ status: 200, description: 'Applications list' })
  async findAllRoApplications(
    @Query() query: RoApplicationQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllRoApplications(query);

    return {
      success: true,
      data: result,
    };
  }

  @Put('ro/applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review RO application' })
  @ApiResponse({ status: 200, description: 'Application reviewed' })
  async reviewRoApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewRoApplicationDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.reviewRoApplication(id, dto, userId);

    return {
      success: true,
      data: result,
    };
  }

  // Presidential Candidates
    @Post('presidential')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add presidential candidate' })
    @ApiResponse({ status: 201, description: 'Candidate created' })
    async createPresidentialCandidate(
        @Body() dto: CreatePresidentialCandidateDto,
        @CurrentUser('id') userId: string,
    ): Promise<{ success: boolean; data: any }> {
        const result = await this.adminService.createPresidentialCandidate(dto, userId);

        return {
            success: true,
            data: result,
        };
    }

    @Get('dashboard/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get dashboard statistics' })
    @ApiResponse({ status: 200, description: 'Dashboard statistics' })
    async getDashboardStats(): Promise<{ success: boolean; data: any }> {
        const stats = await this.adminService.getDashboardStats();

        return {
            success: true,
            data: stats,
        };
    }

    @Get('dashboard/activity')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get recent activity feed' })
    @ApiResponse({ status: 200, description: 'Activity feed' })
    async getActivityFeed(): Promise<{ success: boolean; data: any }> {
        const activity = await this.adminService.getActivityFeed();

        return {
            success: true,
            data: activity,
        };
    }

    @Get('returning-officers')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'List returning officers' })
    @ApiResponse({ status: 200, description: 'Returning officers list' })
    async getReturningOfficers(
        @Query() query?: any,
    ): Promise<{ success: boolean; data: any }> {
        const result = await this.adminService.findAllReturningOfficers(query);

        return {
            success: true,
            data: result,
        };
    }
}
