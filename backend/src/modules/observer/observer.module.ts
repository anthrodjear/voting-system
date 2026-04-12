import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Voter } from '../../entities/voter.entity';
import { Vote } from '../../entities/vote.entity';
import { Candidate } from '../../entities/candidate.entity';
import { Election } from '../../entities/election.entity';
import { VoteTracking } from '../../entities/vote-tracking.entity';

import { BlockchainModule } from '../blockchain/blockchain.module';
import { ObserverController } from './observer.controller';
import { ObserverService } from './observer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Voter,
      Vote,
      Candidate,
      Election,
      VoteTracking,
    ]),
    BlockchainModule,
  ],
  controllers: [ObserverController],
  providers: [ObserverService],
  exports: [ObserverService],
})
export class ObserverModule {}