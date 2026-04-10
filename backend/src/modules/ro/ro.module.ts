import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { RoController } from './ro.controller';
import { RoService } from './ro.service';
import { Voter } from '../../entities/voter.entity';
import { ReturningOfficer } from '../../entities/returning-officer.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { Vote } from '../../entities/vote.entity';
import { Candidate } from '../../entities/candidate.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Batch } from '../../entities/batch.entity';
import { Election } from '../../entities/election.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voter, ReturningOfficer, County, Constituency, Ward, Vote, Candidate, AuditLog, Batch, Election]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [RoController],
  providers: [RoService],
  exports: [RoService],
})
export class RoModule {}