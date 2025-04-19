import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { User } from '../../../domain/users/entity/user.entity';
import { Feed } from '../../../domain/feed/entity/feed.entity';
import { Like } from '../../../domain/like/entity/like.entity';
import { ChatRoom } from '../../../domain/chat/entity/chat-room.entity';
import { MongooseModule } from '@nestjs/mongoose';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Feed, Like, ChatRoom],
      synchronize: true,
      charset: 'utf8mb4',
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/chat',
    ),
    TypeOrmModule.forFeature([User, Feed, Like, ChatRoom]),
  ],
  exports: [TypeOrmModule, MongooseModule],
})
export class DatabaseModule {}