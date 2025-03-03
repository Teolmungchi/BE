import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { User } from '../../../domain/user/entity/user.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: process.env.DB_NAME,
      entities: [User],
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? '3306', 10), // 기본값 3306 설정
      synchronize: true,
      type: process.env.DB_TYPE as any, // DB_TYPE도 동일한 문제 해결 필요
      username: process.env.DB_USERNAME,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}