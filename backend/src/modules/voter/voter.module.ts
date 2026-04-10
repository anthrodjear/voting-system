import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { GeographicModule } from '../geographic/geographic.module';

import { VoterController } from './voter.controller';
import { ElectionController } from './election.controller';
import { BiometricsController } from './biometrics.controller';
import { VoterService } from './voter.service';
import { Voter } from '../../entities/voter.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Election } from '../../entities/election.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voter, VoterBiometric, County, Constituency, Ward, AuditLog, Election]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    GeographicModule,
  ],
  controllers: [VoterController, ElectionController, BiometricsController],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
