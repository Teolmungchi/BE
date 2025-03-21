import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../global/database/module/database.module';
import { UsersModule } from '../../users/module/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeService } from '../service/like.service';
import { LikeRepository } from '../repository/like.repository';
import { LikeController } from '../controller/like.controller';
import { Like } from '../entity/like.entity';
import { FeedModule } from '../../feed/module/feed.module';

@Module({
  imports: [DatabaseModule, FeedModule, UsersModule, TypeOrmModule.forFeature([Like])],
  providers: [LikeService, LikeRepository],
  controllers: [LikeController],
  exports: [LikeRepository],
})
export class LikeModule {}