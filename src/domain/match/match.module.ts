import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './controller/match.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from '../feed/entity/feed.entity';
import { DatabaseModule } from '../../global/database/module/database.module';
import { FeedRepository } from '../feed/repository/feed.repository';
import { MatchingResult } from './entity/matching-result.entity';
import { UsersModule } from '../users/module/users.module';
import { MinioService } from '../s3/service/minio.service';
import { Reports } from './entity/reports.entity';

@Module({
  imports: [DatabaseModule, UsersModule, TypeOrmModule.forFeature([MatchingResult ,Feed, Reports])],
  controllers: [MatchController],
  providers: [MatchService, FeedRepository, MinioService],
})
export class MatchModule {}
