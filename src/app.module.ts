import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerMiddleware } from './global/common/middleware/logger/logger.middleware';
import { UserModule } from './domain/user/module/user.module';
import { DatabaseModule } from './global/database/module/database.module';

@Module({
  imports: [DatabaseModule, UserModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
