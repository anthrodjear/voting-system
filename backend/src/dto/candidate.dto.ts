import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
} from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: 'Mary' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ enum: ['president', 'governor', 'senator', 'mp', 'mca'] })
  @IsEnum(['president', 'governor', 'senator', 'mp', 'mca'])
  position: string;

  @ApiPropertyOptional({ example: 'Nairobi' })
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ example: 'Party A' })
  @IsOptional()
  @IsString()
  party?: string;

  @ApiPropertyOptional({ example: 'PA' })
  @IsOptional()
  @IsString()
  partyAbbreviation?: string;

  @ApiPropertyOptional({ example: '1980-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Base64 encoded photo' })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional({ description: 'Campaign manifesto' })
  @IsOptional()
  @IsString()
  manifesto?: string;

  @ApiPropertyOptional({ example: ['Infrastructure', 'Healthcare'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];
}

export class ApproveCandidateDto {
  @ApiProperty({ enum: ['approve', 'reject'] })
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @ApiPropertyOptional({ description: 'Rejection reason (if rejecting)' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class CandidateQueryDto {
  @ApiPropertyOptional({ enum: ['president', 'governor', 'senator', 'mp', 'mca'] })
  @IsOptional()
  @IsEnum(['president', 'governor', 'senator', 'mp', 'mca'])
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;

  @ApiPropertyOptional({ enum: ['approved', 'pending', 'rejected'] })
  @IsOptional()
  @IsEnum(['approved', 'pending', 'rejected'])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number = 20;
}

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {}
