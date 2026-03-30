import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
