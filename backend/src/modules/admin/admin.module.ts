import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { RoApplication } from '../../entities/ro-application.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { Candidate } from '../../entities/candidate.entity';
import { PresidentialCandidate } from '../../entities/presidential-candidate.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Voter } from '../../entities/voter.entity';
import { Vote } from '../../entities/vote.entity';
import { Election } from '../../entities/election.entity';
import { SuperAdmin } from '../../entities/super-admin.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      County,
      Constituency,
      Ward,
      RoApplication,
      ReturningOfficer,
      Candidate,
      PresidentialCandidate,
      AuditLog,
      Voter,
      Vote,
      Election,
      SuperAdmin,
      VoteTracking,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
