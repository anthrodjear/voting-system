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

import { CandidateService } from './candidate.service';
import { CreateCandidateDto, ApproveCandidateDto, CandidateQueryDto } from '../../dto/candidate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('candidates')
@Controller('candidates')
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get()
  @ApiOperation({ summary: 'List candidates with filters' })
  @ApiQuery({ name: 'position', required: false, enum: ['president', 'governor', 'senator', 'mp', 'mca'] })
  @ApiQuery({ name: 'county', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Candidates list' })
  async findAll(@Query() query: CandidateQueryDto): Promise<{ success: boolean; data: any }> {
    const result = await this.candidateService.findAll(query);

    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate details' })
  @ApiResponse({ status: 200, description: 'Candidate details' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<{ success: boolean; data: any }> {
    const candidate = await this.candidateService.findById(id);

    return {
      success: true,
      data: {
        candidateId: candidate.id,
        fullName: `${candidate.firstName} ${candidate.middleName || ''} ${candidate.lastName}`.trim(),
        position: candidate.position,
        county: candidate.county?.countyName || candidate.countyName,
        party: candidate.partyName,
        photo: candidate.photo,
        manifesto: candidate.manifesto,
        status: candidate.status,
        approvedBy: candidate.approvedBy,
        approvedAt: candidate.approvedAt,
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro', 'admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  async create(
    @Body() dto: CreateCandidateDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ): Promise<{ success: boolean; data: { candidateId: string; status: string; message: string } }> {
    const result = await this.candidateService.create(dto, userId, userRole);

    return {
      success: true,
      data: result,
    };
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate status updated' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveCandidateDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.candidateService.approve(id, dto, userId);

    return {
      success: true,
      data: result,
    };
  }

  // POST alias for frontend compatibility (frontend calls POST /candidates/:id/approve)
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject a candidate (POST alias)' })
  @ApiResponse({ status: 200, description: 'Candidate status updated' })
  async approvePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveCandidateDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.candidateService.approve(id, dto, userId);

    return {
      success: true,
      data: result,
    };
  }

  // POST alias for reject (frontend calls POST /candidates/:id/reject)
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a candidate (POST alias)' })
  @ApiResponse({ status: 200, description: 'Candidate rejected' })
  async rejectPost(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ApproveCandidateDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.candidateService.approve(id, { ...dto, action: 'reject' }, userId);

    return {
      success: true,
      data: result,
    };
  }
}
