import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { User } from '../../../domain/users/entity/user.entity';
import { Feed } from '../../../domain/feed/entity/feed.entity';
import { Like } from '../../../domain/like/entity/like.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      database: process.env.DB_NAME,
      entities: [User, Feed, Like],
      host: process.env.DB_HOST,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT ?? '3306', 10), // 기본값 3306 설정
      synchronize: true,
      type: process.env.DB_TYPE as any, // DB_TYPE도 동일한 문제 해결 필요
      charset: 'utf8mb4',
      username: process.env.DB_USERNAME,
    }),
    TypeOrmModule.forFeature([User, Feed, Like]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}