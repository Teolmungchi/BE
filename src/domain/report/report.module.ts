import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { DatabaseModule } from '../../global/database/module/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from '../feed/entity/feed.entity';
import { MatchingResult } from '../match/entity/matching-result.entity';
import { Report } from './entity/report.entity';

@Module({
  imports: [DatabaseModule, TypeOrmModule.forFeature([Report])],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
