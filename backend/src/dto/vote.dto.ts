import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty({ description: 'Ballot ID' })
  @IsString()
  @IsNotEmpty()
  ballotId: string;

  @ApiProperty({ description: 'Encrypted vote data' })
  @IsString()
  @IsNotEmpty()
  encryptedVote: string;

  @ApiPropertyOptional({ description: 'Zero-knowledge proof' })
  @IsOptional()
  @IsString()
  zkProof?: string;

  @ApiPropertyOptional({ description: 'Batch ID (for batch voting)' })
  @IsOptional()
  @IsString()
  batchId?: string;
}

export class VoteConfirmationResponseDto {
  @ApiProperty()
  confirmationId: string;

  @ApiProperty()
  voteHash: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  message: string;
}

export class VoteStatusResponseDto {
  @ApiProperty()
  hasVoted: boolean;

  @ApiPropertyOptional()
  votedAt?: Date;

  @ApiPropertyOptional()
  confirmationId?: string;
}

export class BallotResponseDto {
  @ApiProperty()
  ballotId: string;

  @ApiProperty()
  electionId: string;

  @ApiProperty()
  positions: Array<{
    position: string;
    county?: string;
    candidates: Array<{
      candidateId: string;
      fullName: string;
      photo?: string;
    }>;
  }>;
}
