import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { VoterController } from './voter.controller';
import { VoterService } from './voter.service';
import { Voter } from '../../entities/voter.entity';
import { VoterBiometric } from '../../entities/voter-biometric.entity';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';
import { AuditLog } from '../../entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Voter, VoterBiometric, County, Constituency, Ward, AuditLog]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [VoterController],
  providers: [VoterService],
  exports: [VoterService],
})
export class VoterModule {}
