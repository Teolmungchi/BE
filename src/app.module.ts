import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //전역 모듈로 설정(모든 곳에서 사용 가능)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
