import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JoinBatchDto {
  @ApiPropertyOptional({ description: 'Election ID' })
  @IsOptional()
  @IsString()
  electionId?: string;
}

export class BatchVoteDto {
  @ApiProperty({ description: 'Encrypted vote' })
  @IsString()
  @IsNotEmpty()
  encryptedVote: string;

  @ApiPropertyOptional({ description: 'Zero-knowledge proof' })
  @IsOptional()
  @IsString()
  zkProof?: string;
}

export class BatchStatusResponseDto {
  @ApiProperty()
  batchId: string;

  @ApiProperty({ enum: ['waiting', 'active', 'submitting', 'completed'] })
  status: string;

  @ApiProperty()
  totalVoters: number;

  @ApiProperty()
  currentVoters: number;

  @ApiProperty()
  votesCollected: number;

  @ApiPropertyOptional()
  timeRemaining?: number;
}

export class HeartbeatResponseDto {
  @ApiProperty()
  heartbeatReceived: boolean;

  @ApiProperty()
  positionSecured: boolean;
}

export class LeaveBatchResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  canRejoin: boolean;
}
