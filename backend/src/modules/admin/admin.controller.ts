import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
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
  UpdateCountyDto,
  UpdateCountyStatusDto,
  CreateConstituencyDto,
  UpdateConstituencyDto,
  UpdateConstituencyStatusDto,
  CreateWardDto,
  UpdateWardDto,
  UpdateWardStatusDto,
  CreateGeographicChangeDto,
  ReviewGeographicChangeDto,
  RoApplicationDto,
  ReviewRoApplicationDto,
  RoApplicationQueryDto,
  CreatePresidentialCandidateDto,
  CreateElectionDto,
  UpdateElectionDto,
  UpdateElectionStatusDto,
  ElectionQueryDto,
  AdminCreateCandidateDto,
  AdminUpdateCandidateDto,
  UpdateCandidateStatusDto,
  AdminCandidateQueryDto,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateAdminStatusDto,
  AssignCountyDto,
  SuspendRoDto,
  VoterQueryDto,
  UpdateVoterStatusDto,
  AuditLogQueryDto,
} from '../../dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== County Management ====================

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
    return { success: true, data: county };
  }

  @Get('counties')
  @ApiOperation({ summary: 'List all counties with voter counts and RO status' })
  @ApiResponse({ status: 200, description: 'Counties list' })
  async findAllCounties(): Promise<{ success: boolean; data: any }> {
    const counties = await this.adminService.findAllCounties();
    return { success: true, data: counties };
  }

  @Get('counties/:code')
  @ApiOperation({ summary: 'Get county by code' })
  @ApiResponse({ status: 200, description: 'County details' })
  async findCountyByCode(
    @Param('code') code: string,
  ): Promise<{ success: boolean; data: any }> {
    const county = await this.adminService.findCountyByCode(code);
    return { success: true, data: county };
  }

  @Put('counties/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update county details' })
  @ApiResponse({ status: 200, description: 'County updated' })
  async updateCounty(
    @Param('code') code: string,
    @Body() dto: UpdateCountyDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const county = await this.adminService.updateCounty(code, dto, userId);
    return { success: true, data: county };
  }

  @Patch('counties/:code/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/deactivate county' })
  @ApiResponse({ status: 200, description: 'County status updated' })
  async updateCountyStatus(
    @Param('code') code: string,
    @Body() dto: UpdateCountyStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const county = await this.adminService.updateCountyStatus(code, dto, userId);
    return { success: true, data: county };
  }

  @Get('counties/:code/constituencies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get constituencies for a county' })
  @ApiResponse({ status: 200, description: 'Constituencies list' })
  async getCountyConstituencies(
    @Param('code') code: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituencies = await this.adminService.getCountyConstituencies(code);
    return { success: true, data: constituencies };
  }

  // ==================== Constituency Management (Admin) ====================

  @Post('constituencies')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new constituency' })
  @ApiResponse({ status: 201, description: 'Constituency created' })
  async createConstituency(
    @Body() dto: CreateConstituencyDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituency = await this.adminService.createConstituency(dto, userId);
    return { success: true, data: constituency };
  }

  @Get('constituencies')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all constituencies (optionally filtered by county)' })
  @ApiQuery({ name: 'countyId', required: false })
  @ApiResponse({ status: 200, description: 'Constituencies list' })
  async findAllConstituencies(
    @Query('countyId') countyId?: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituencies = await this.adminService.findAllConstituencies(countyId);
    return { success: true, data: constituencies };
  }

  @Get('constituencies/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get constituency by ID' })
  @ApiResponse({ status: 200, description: 'Constituency details' })
  async getConstituencyById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituency = await this.adminService.getConstituencyById(id);
    return { success: true, data: constituency };
  }

  @Put('constituencies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update constituency details' })
  @ApiResponse({ status: 200, description: 'Constituency updated' })
  async updateConstituency(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConstituencyDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituency = await this.adminService.updateConstituency(id, dto, userId);
    return { success: true, data: constituency };
  }

  @Patch('constituencies/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/deactivate constituency' })
  @ApiResponse({ status: 200, description: 'Constituency status updated' })
  async updateConstituencyStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConstituencyStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const constituency = await this.adminService.updateConstituencyStatus(id, dto, userId);
    return { success: true, data: constituency };
  }

  @Delete('constituencies/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a constituency' })
  @ApiResponse({ status: 200, description: 'Constituency deleted' })
  async deleteConstituency(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.deleteConstituency(id, userId);
    return { success: true, data: result };
  }

  // ==================== Ward Management (Admin) ====================

  @Post('wards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new ward' })
  @ApiResponse({ status: 201, description: 'Ward created' })
  async createWard(
    @Body() dto: CreateWardDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const ward = await this.adminService.createWard(dto, userId);
    return { success: true, data: ward };
  }

  @Get('wards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all wards (optionally filtered by constituency)' })
  @ApiQuery({ name: 'constituencyId', required: false })
  @ApiResponse({ status: 200, description: 'Wards list' })
  async findAllWards(
    @Query('constituencyId') constituencyId?: string,
  ): Promise<{ success: boolean; data: any }> {
    const wards = await this.adminService.findAllWards(constituencyId);
    return { success: true, data: wards };
  }

  @Get('wards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ward by ID' })
  @ApiResponse({ status: 200, description: 'Ward details' })
  async getWardById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const ward = await this.adminService.getWardById(id);
    return { success: true, data: ward };
  }

  @Put('wards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ward details' })
  @ApiResponse({ status: 200, description: 'Ward updated' })
  async updateWard(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWardDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const ward = await this.adminService.updateWard(id, dto, userId);
    return { success: true, data: ward };
  }

  @Patch('wards/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/deactivate ward' })
  @ApiResponse({ status: 200, description: 'Ward status updated' })
  async updateWardStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWardStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const ward = await this.adminService.updateWardStatus(id, dto, userId);
    return { success: true, data: ward };
  }

  @Delete('wards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a ward' })
  @ApiResponse({ status: 200, description: 'Ward deleted' })
  async deleteWard(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.deleteWard(id, userId);
    return { success: true, data: result };
  }

  // ==================== RO Geographic Change Proposals ====================

  @Post('geographic-changes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RO proposes a constituency/ward change (requires admin approval)' })
  @ApiResponse({ status: 201, description: 'Change proposal submitted' })
  async proposeGeographicChange(
    @Body() dto: CreateGeographicChangeDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const change = await this.adminService.proposeGeographicChange(dto, userId);
    return { success: true, data: change };
  }

  @Get('geographic-changes/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending geographic change proposals' })
  @ApiResponse({ status: 200, description: 'Pending changes list' })
  async getPendingGeographicChanges(
    @Query('countyId') countyId?: string,
  ): Promise<{ success: boolean; data: any }> {
    const changes = await this.adminService.getPendingGeographicChanges(countyId);
    return { success: true, data: changes };
  }

  @Put('geographic-changes/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin reviews and approves/rejects a geographic change' })
  @ApiResponse({ status: 200, description: 'Change reviewed' })
  async reviewGeographicChange(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewGeographicChangeDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.reviewGeographicChange(id, dto, userId);
    return { success: true, data: result };
  }

  @Get('geographic-changes/my-proposals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ro')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'RO views their own change proposals' })
  @ApiResponse({ status: 200, description: 'My proposals list' })
  async getMyProposals(
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const changes = await this.adminService.getMyProposals(userId);
    return { success: true, data: changes };
  }

  // ==================== RO Applications ====================

  @Post('ro/applications')
  @ApiOperation({ summary: 'Submit RO application' })
  @ApiResponse({ status: 201, description: 'Application submitted' })
  async submitRoApplication(
    @Body() dto: RoApplicationDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.submitRoApplication(dto);
    return { success: true, data: result };
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
    return { success: true, data: result };
  }

  @Put('ro/applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review RO application (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Application reviewed' })
  async reviewRoApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewRoApplicationDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.reviewRoApplication(id, dto, userId);
    return { success: true, data: result };
  }

  // ==================== Returning Officer Management ====================

  @Get('returning-officers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List returning officers' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'county', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Returning officers list' })
  async getReturningOfficers(
    @Query() query?: any,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllReturningOfficers(query);
    return { success: true, data: result };
  }

  @Get('returning-officers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get returning officer by ID' })
  @ApiResponse({ status: 200, description: 'Returning officer details' })
  async getReturningOfficerById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const officer = await this.adminService.findReturningOfficerById(id);
    return { success: true, data: officer };
  }

  @Post('returning-officers/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend a returning officer' })
  @ApiResponse({ status: 200, description: 'Officer suspended' })
  async suspendReturningOfficer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendRoDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.suspendReturningOfficer(id, dto, userId);
    return { success: true, data: result };
  }

  @Post('returning-officers/:id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate a suspended returning officer' })
  @ApiResponse({ status: 200, description: 'Officer reactivated' })
  async reactivateReturningOfficer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.reactivateReturningOfficer(id, userId);
    return { success: true, data: result };
  }

  @Post('returning-officers/:id/assign-county')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign county to returning officer' })
  @ApiResponse({ status: 200, description: 'County assigned' })
  async assignCountyToOfficer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignCountyDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.assignCountyToOfficer(id, dto, userId);
    return { success: true, data: result };
  }

  // ==================== Presidential Candidates ====================

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
    return { success: true, data: result };
  }

  // ==================== Election Management ====================

  @Post('elections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new election' })
  @ApiResponse({ status: 201, description: 'Election created' })
  async createElection(
    @Body() dto: CreateElectionDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.adminService.createElection(dto, userId);
    return { success: true, data: election };
  }

  @Get('elections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all elections' })
  @ApiQuery({ name: 'electionType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Elections list' })
  async findAllElections(
    @Query() query: ElectionQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllElections(query);
    return { success: true, data: result };
  }

  @Get('elections/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get election by ID' })
  @ApiResponse({ status: 200, description: 'Election details' })
  async findElectionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.adminService.findElectionById(id);
    return { success: true, data: election };
  }

  @Put('elections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update election details' })
  @ApiResponse({ status: 200, description: 'Election updated' })
  async updateElection(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateElectionDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.adminService.updateElection(id, dto, userId);
    return { success: true, data: election };
  }

  @Patch('elections/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change election status' })
  @ApiResponse({ status: 200, description: 'Election status updated' })
  async updateElectionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateElectionStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const election = await this.adminService.updateElectionStatus(id, dto, userId);
    return { success: true, data: election };
  }

  @Delete('elections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a draft election' })
  @ApiResponse({ status: 200, description: 'Election deleted' })
  async deleteElection(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.deleteElection(id, userId);
    return { success: true, data: result };
  }

  // ==================== Admin User Management ====================

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all admin users' })
  @ApiResponse({ status: 200, description: 'Admin users list' })
  async findAllAdminUsers(
    @Query() query?: any,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllAdminUsers(query);
    return { success: true, data: result };
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin user created' })
  async createAdminUser(
    @Body() dto: CreateAdminUserDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const user = await this.adminService.createAdminUser(dto, userId);
    return { success: true, data: user };
  }

  @Put('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin user' })
  @ApiResponse({ status: 200, description: 'Admin user updated' })
  async updateAdminUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const user = await this.adminService.updateAdminUser(id, dto, userId);
    return { success: true, data: user };
  }

  @Patch('users/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate/deactivate admin user' })
  @ApiResponse({ status: 200, description: 'Admin user status updated' })
  async updateAdminStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.updateAdminStatus(id, dto, userId);
    return { success: true, data: result };
  }

  // ==================== Candidate Management ====================

  @Post('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new candidate (all positions including president)' })
  @ApiResponse({ status: 201, description: 'Candidate created' })
  async createCandidate(
    @Body() dto: AdminCreateCandidateDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const candidate = await this.adminService.createCandidate(dto, userId);
    return { success: true, data: candidate };
  }

  @Get('candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all candidates' })
  @ApiQuery({ name: 'position', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Candidates list' })
  async findAllCandidates(
    @Query() query: AdminCandidateQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllCandidates(query);
    return { success: true, data: result };
  }

  @Put('candidates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update candidate details (rename, party, etc.)' })
  @ApiResponse({ status: 200, description: 'Candidate updated' })
  async updateCandidate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateCandidateDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const candidate = await this.adminService.updateCandidate(id, dto, userId);
    return { success: true, data: candidate };
  }

  @Patch('candidates/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve/reject candidate' })
  @ApiResponse({ status: 200, description: 'Candidate status updated' })
  async updateCandidateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandidateStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.updateCandidateStatus(id, dto, userId);
    return { success: true, data: result };
  }

  @Delete('candidates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted' })
  async deleteCandidate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.deleteCandidate(id, userId);
    return { success: true, data: result };
  }

  // ==================== Voter Management ====================

  @Get('voters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all voters' })
  @ApiQuery({ name: 'county', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Voters list' })
  async findAllVoters(
    @Query() query: VoterQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.findAllVoters(query);
    return { success: true, data: result };
  }

  @Patch('voters/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update voter status' })
  @ApiResponse({ status: 200, description: 'Voter status updated' })
  async updateVoterStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVoterStatusDto,
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.updateVoterStatus(id, dto, userId);
    return { success: true, data: result };
  }

  @Get('voters/stats/by-county')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get voter statistics by county' })
  @ApiResponse({ status: 200, description: 'Voter stats by county' })
  async getVoterStatsByCounty(): Promise<{ success: boolean; data: any }> {
    const stats = await this.adminService.getVoterStatsByCounty();
    return { success: true, data: stats };
  }

  // ==================== Dashboard ====================

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats(): Promise<{ success: boolean; data: any }> {
    const stats = await this.adminService.getDashboardStats();
    return { success: true, data: stats };
  }

  @Get('dashboard/activity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activity feed' })
  @ApiResponse({ status: 200, description: 'Activity feed' })
  async getActivityFeed(): Promise<{ success: boolean; data: any }> {
    const activity = await this.adminService.getActivityFeed();
    return { success: true, data: activity };
  }

  // ==================== System Health ====================

  @Get('system/health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'System health' })
  async getSystemHealth(): Promise<{ success: boolean; data: any }> {
    const health = await this.adminService.getSystemHealth();
    return { success: true, data: health };
  }

  // ==================== Audit Logs ====================

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  async getAuditLogs(
    @Query() query: AuditLogQueryDto,
  ): Promise<{ success: boolean; data: any }> {
    const result = await this.adminService.getAuditLogs(query);
    return { success: true, data: result };
  }

  @Delete('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear all audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs cleared' })
  async clearAuditLogs(): Promise<{ success: boolean; message: string }> {
    await this.adminService.clearAuditLogs();
    return { success: true, message: 'Audit logs cleared successfully' };
  }
}
