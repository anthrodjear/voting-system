import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsObject,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCountyDto {
  @ApiProperty({ example: '047' })
  @IsString()
  @IsNotEmpty()
  countyCode: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  countyName: string;

  @ApiProperty({ example: 'Central' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  capital?: string;

  @ApiPropertyOptional({ example: 4500000 })
  @IsOptional()
  @IsNumber()
  population?: number;

  @ApiPropertyOptional({ example: 696.1 })
  @IsOptional()
  @IsNumber()
  areaSqKm?: number;
}

export class RoApplicationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '87654321' })
  @IsString()
  @IsNotEmpty()
  nationalId: string;

  @ApiProperty({ example: 'john.smith@email.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  preferredCounty1: string;

  @ApiProperty({ example: 'Mombasa' })
  @IsString()
  @IsNotEmpty()
  preferredCounty2: string;

  @ApiPropertyOptional({ example: "Bachelor's Degree" })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiPropertyOptional({ example: '5 years in public service' })
  @IsOptional()
  @IsString()
  previousExperience?: string;

  @ApiPropertyOptional({ description: 'Array of document objects' })
  @IsOptional()
  @IsArray()
  documents?: Array<{
    type: string;
    data: string;
  }>;
}

export class ReviewRoApplicationDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  assignedCounty?: string;

  @ApiPropertyOptional({ example: 'Approved based on qualifications' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RoApplicationQueryDto {
  @ApiPropertyOptional({ enum: ['submitted', 'under_review', 'approved', 'rejected'] })
  @IsOptional()
  @IsEnum(['submitted', 'under_review', 'approved', 'rejected'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class CreatePresidentialCandidateDto {
  @ApiProperty({ example: 'Candidate Name' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '1960-01-01' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Party Name' })
  @IsString()
  @IsNotEmpty()
  party: string;

  @ApiPropertyOptional({ description: 'Base64 encoded photo' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ description: 'Campaign manifesto' })
  @IsOptional()
  @IsString()
  manifesto?: string;

  @ApiProperty({ example: 'Deputy Name' })
  @IsString()
  @IsNotEmpty()
  deputyName: string;

  @ApiProperty({ example: '1962-05-15' })
  @IsOptional()
  @IsString()
  deputyDateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Campaign slogan' })
  @IsOptional()
  @IsString()
  campaignSlogan?: string;
}

// ==================== Election DTOs ====================

export class CreateElectionDto {
  @ApiProperty({ example: 'General Election 2027' })
  @IsString()
  @IsNotEmpty()
  electionName: string;

  @ApiProperty({ example: 'general', enum: ['general', 'by-election', 'primary'] })
  @IsString()
  @IsNotEmpty()
  electionType: string;

  @ApiProperty({ example: '2027-08-08' })
  @IsDateString()
  electionDate: string;

  @ApiPropertyOptional({ example: '2027-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ example: '2027-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  nominationStartDate?: string;

  @ApiPropertyOptional({ example: '2027-05-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  nominationEndDate?: string;

  @ApiPropertyOptional({ example: '2027-08-08T06:00:00Z' })
  @IsOptional()
  @IsDateString()
  votingStartDate?: string;

  @ApiPropertyOptional({ example: '2027-08-08T18:00:00Z' })
  @IsOptional()
  @IsDateString()
  votingEndDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enableOnlineVoting?: boolean;
}

export class UpdateElectionDto {
  @ApiPropertyOptional({ example: 'General Election 2027' })
  @IsOptional()
  @IsString()
  electionName?: string;

  @ApiPropertyOptional({ example: 'general' })
  @IsOptional()
  @IsString()
  electionType?: string;

  @ApiPropertyOptional({ example: '2027-08-08' })
  @IsOptional()
  @IsDateString()
  electionDate?: string;

  @ApiPropertyOptional({ example: '2027-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @ApiPropertyOptional({ example: '2027-05-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  nominationStartDate?: string;

  @ApiPropertyOptional({ example: '2027-05-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  nominationEndDate?: string;

  @ApiPropertyOptional({ example: '2027-08-08T06:00:00Z' })
  @IsOptional()
  @IsDateString()
  votingStartDate?: string;

  @ApiPropertyOptional({ example: '2027-08-08T18:00:00Z' })
  @IsOptional()
  @IsDateString()
  votingEndDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  enableOnlineVoting?: boolean;
}

export class UpdateElectionStatusDto {
  @ApiProperty({
    enum: ['draft', 'published', 'registration_open', 'voting_open', 'voting_closed', 'results_published'],
    example: 'published',
  })
  @IsEnum(['draft', 'published', 'registration_open', 'voting_open', 'voting_closed', 'results_published'])
  status: string;
}

export class ElectionQueryDto {
  @ApiPropertyOptional({ enum: ['general', 'by-election', 'primary'] })
  @IsOptional()
  @IsString()
  electionType?: string;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'registration_open', 'voting_open', 'voting_closed', 'results_published'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

// ==================== County Update DTOs ====================

export class UpdateCountyDto {
  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  countyName?: string;

  @ApiPropertyOptional({ example: 'Central' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  capital?: string;

  @ApiPropertyOptional({ example: 4500000 })
  @IsOptional()
  @IsNumber()
  population?: number;

  @ApiPropertyOptional({ example: 696.1 })
  @IsOptional()
  @IsNumber()
  areaSqKm?: number;
}

export class UpdateCountyStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

export class CreateConstituencyDto {
  @ApiProperty({ example: '001' })
  @IsString()
  @IsNotEmpty()
  constituencyCode: string;

  @ApiProperty({ example: 'Kasarani' })
  @IsString()
  @IsNotEmpty()
  constituencyName: string;

  @ApiProperty({ example: 'county-uuid' })
  @IsString()
  @IsNotEmpty()
  countyId: string;
}

export class CreateWardDto {
  @ApiProperty({ example: '001' })
  @IsString()
  @IsNotEmpty()
  wardCode: string;

  @ApiProperty({ example: 'Kasarani Central' })
  @IsString()
  @IsNotEmpty()
  wardName: string;

  @ApiProperty({ example: 'constituency-uuid' })
  @IsString()
  @IsNotEmpty()
  constituencyId: string;
}

export class UpdateConstituencyDto {
  @ApiPropertyOptional({ example: 'Kasarani North' })
  @IsOptional()
  @IsString()
  constituencyName?: string;

  @ApiPropertyOptional({ example: 'county-uuid' })
  @IsOptional()
  @IsString()
  countyId?: string;
}

export class UpdateConstituencyStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateWardDto {
  @ApiPropertyOptional({ example: 'Kasarani Central North' })
  @IsOptional()
  @IsString()
  wardName?: string;

  @ApiPropertyOptional({ example: 'constituency-uuid' })
  @IsOptional()
  @IsString()
  constituencyId?: string;
}

export class UpdateWardStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

export interface PendingGeographicChange {
  id: string;
  type: 'constituency' | 'ward';
  action: 'create' | 'update' | 'rename' | 'delete';
  resourceId: string;
  resourceName: string;
  countyId: string;
  countyName: string;
  proposedBy: string;
  proposedByName: string;
  proposedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  details: any;
}

export class CreateGeographicChangeDto {
  @ApiProperty({ enum: ['constituency', 'ward'] })
  @IsEnum(['constituency', 'ward'])
  type: string;

  @ApiProperty({ enum: ['create', 'update', 'rename', 'delete'] })
  @IsEnum(['create', 'update', 'rename', 'delete'])
  action: string;

  @ApiPropertyOptional({ example: 'constituency-uuid' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiProperty({ example: 'New Constituency Name' })
  @IsString()
  @IsNotEmpty()
  resourceName: string;

  @ApiProperty({ example: 'county-uuid' })
  @IsString()
  @IsNotEmpty()
  countyId: string;

  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  countyName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
}

export class ReviewGeographicChangeDto {
  @ApiProperty({ enum: ['approved', 'rejected'] })
  @IsEnum(['approved', 'rejected'])
  action: string;

  @ApiPropertyOptional({ example: 'Approved - verified against IEBC records' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== Admin User DTOs ====================

export class CreateAdminUserDto {
  @ApiProperty({ example: 'admin@iebc.go.ke' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'admin', enum: ['admin', 'super_admin'] })
  @IsOptional()
  @IsEnum(['admin', 'super_admin'])
  level?: string;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+254712345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'admin', enum: ['admin', 'super_admin'] })
  @IsOptional()
  @IsEnum(['admin', 'super_admin'])
  level?: string;
}

export class UpdateAdminStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

// ==================== RO Management DTOs ====================

export class AssignCountyDto {
  @ApiProperty({ example: 'Nairobi' })
  @IsString()
  @IsNotEmpty()
  countyName: string;

  @ApiProperty({ example: 'county-uuid' })
  @IsString()
  @IsNotEmpty()
  countyId: string;
}

export class SuspendRoDto {
  @ApiPropertyOptional({ example: 'Violation of electoral code' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== Candidate Admin DTOs ====================

export class UpdateCandidateStatusDto {
  @ApiProperty({ enum: ['approved', 'rejected', 'pending'] })
  @IsEnum(['approved', 'rejected', 'pending'])
  status: string;

  @ApiPropertyOptional({ example: 'Does not meet requirements' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class AdminCandidateQueryDto {
  @ApiPropertyOptional({ enum: ['president', 'governor', 'senator', 'mp', 'mca'] })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ enum: ['draft', 'pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

// ==================== Voter Admin DTOs ====================

export class VoterQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ enum: ['registered', 'verified', 'pending', 'rejected', 'suspended'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class UpdateVoterStatusDto {
  @ApiProperty({ enum: ['registered', 'verified', 'pending', 'rejected', 'suspended'] })
  @IsEnum(['registered', 'verified', 'pending', 'rejected', 'suspended'])
  status: string;

  @ApiPropertyOptional({ example: 'Failed verification' })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ==================== Audit Log DTOs ====================

export class AuditLogQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;
}
