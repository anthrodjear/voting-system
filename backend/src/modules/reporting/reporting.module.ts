import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';
import { Election } from '../../entities/election.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Vote } from '../../entities/vote.entity';
import { Voter } from '../../entities/voter.entity';
import { County } from '../../entities/county.entity';
import { AuditLog } from '../../entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Election, Candidate, Vote, Voter, County, AuditLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
  exports: [ReportingService],
})
export class ReportingModule {}
