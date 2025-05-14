import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../global/database/module/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from '../entity/feed.entity';
import { FeedRepository } from '../repository/feed.repository';
import { FeedController } from '../controller/feed.controller';
import { FeedService } from '../service/feed.service';
import { UsersModule } from '../../users/module/users.module';
import { MatchingResult } from '../../match/entity/matching-result.entity';

@Module({
  imports: [DatabaseModule, UsersModule,TypeOrmModule.forFeature([Feed, MatchingResult])],
  providers: [FeedService, FeedRepository],
  controllers: [FeedController],
  exports: [FeedRepository],
})
export class FeedModule {}




