import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './global/common/middleware/logger/logger.middleware';
import { UsersModule } from './domain/users/module/users.module';
import * as dotenv from 'dotenv';
import { DatabaseModule } from './global/database/module/database.module';
import { AuthModule } from './global/auth/module/auth.module';

dotenv.config();
@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
