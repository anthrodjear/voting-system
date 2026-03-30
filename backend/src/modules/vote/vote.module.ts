import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { Vote } from '../../entities/vote.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';
import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Voter } from '../../entities/voter.entity';
import { AuditLog } from '../../entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, VoteTracking, Election, Candidate, Voter, AuditLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
