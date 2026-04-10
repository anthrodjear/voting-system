import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelBallotDto {
  @ApiProperty({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class PendingVoteResponseDto {
  @ApiProperty()
  electionId: string;

  @ApiProperty()
  positionId: string;

  @ApiProperty()
  positionTitle: string;

  @ApiProperty()
  hasVoted: boolean;
}

export class BallotCancelResponseDto {
  @ApiProperty()
  cancelled: boolean;

  @ApiProperty()
  ballotId: string;

  @ApiProperty()
  message: string;
}
