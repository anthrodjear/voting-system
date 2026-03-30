import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { Batch } from '../../entities/batch.entity';
import { Election } from '../../entities/election.entity';
import { Vote } from '../../entities/vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Batch, Election, Vote]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [BatchController],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
