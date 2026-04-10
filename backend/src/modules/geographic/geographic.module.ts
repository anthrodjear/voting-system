import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographicService } from './geographic.service';
import { GeographicController } from './geographic.controller';
import { County } from '../../entities/county.entity';
import { Constituency } from '../../entities/constituency.entity';
import { Ward } from '../../entities/ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([County, Constituency, Ward])],
  controllers: [GeographicController],
  providers: [GeographicService],
  exports: [GeographicService],
})
export class GeographicModule {}
