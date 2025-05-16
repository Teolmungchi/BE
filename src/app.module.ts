import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './global/common/middleware/logger/logger.middleware';
import { UsersModule } from './domain/users/module/users.module';
import * as dotenv from 'dotenv';
import { DatabaseModule } from './global/database/module/database.module';
import { AuthModule } from './global/auth/module/auth.module';
import { MinioModule } from './domain/s3/module/minio.module';
import { FeedModule } from './domain/feed/module/feed.module';
import { LikeModule } from './domain/like/module/like.module';
import { ChatModule } from './domain/chat/module/chat.module';
import { AdminModule } from './domain/admin/admin.module';
import { MatchModule } from './domain/match/match.module';
import { ReportModule } from './domain/report/report.module';

dotenv.config();
@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    AuthModule,
    MinioModule,
    FeedModule,
    LikeModule,
    ChatModule,
    AdminModule,
    MatchModule,
    ReportModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
