import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ElectionResultsQueryDto {
  @ApiPropertyOptional({ enum: ['national', 'county', 'constituency'] })
  @IsOptional()
  @IsEnum(['national', 'county', 'constituency'])
  level?: 'national' | 'county' | 'constituency';

  @ApiPropertyOptional({ enum: ['president', 'governor', 'senator', 'mp', 'mca'] })
  @IsOptional()
  @IsEnum(['president', 'governor', 'senator', 'mp', 'mca'])
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electionId?: string;
}

export class TurnoutQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  electionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  county?: string;
}

export class ElectionResultsResponseDto {
  @ApiPropertyOptional()
  electionId: string;

  @ApiPropertyOptional()
  position: string;

  @ApiPropertyOptional()
  totalVotes: number;

  @ApiPropertyOptional()
  results: Array<{
    candidateId: string;
    candidateName: string;
    party: string;
    votes: number;
    percentage: number;
  }>;

  @ApiPropertyOptional()
  timestamp: Date;
}

export class TurnoutResponseDto {
  @ApiPropertyOptional()
  totalRegistered: number;

  @ApiPropertyOptional()
  totalVoted: number;

  @ApiPropertyOptional()
  turnoutPercentage: number;

  @ApiPropertyOptional()
  byCounty: Array<{
    county: string;
    registered: number;
    voted: number;
    turnout: number;
  }>;
}

export class AuditReportResponseDto {
  @ApiPropertyOptional()
  reportId: string;

  @ApiPropertyOptional()
  generatedAt: Date;

  @ApiPropertyOptional()
  totalVotes: number;

  @ApiPropertyOptional()
  blockchainConfirmations: number;

  @ApiPropertyOptional()
  integrityCheck: string;

  @ApiPropertyOptional()
  hashChain: string;
}
