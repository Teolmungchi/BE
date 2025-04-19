import { Module } from '@nestjs/common';
import { ChatService } from '../service/chat.service';
import { ChatGateway } from '../gateway/chat.gateway';
import { User } from '../../users/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../global/auth/module/auth.module';
import { ChatRoom } from '../entity/chat-room.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatMessage, ChatMessageSchema } from '../schema/chat-message.schema';
import { ChatRoomRepository } from '../repository/chat-room.repository';
import { ChatController } from '../controller/chat.controller';
import { AuthService } from '../../../global/auth/service/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatRoom, User]),
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
    ]),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, ChatRoomRepository],
  exports: [ChatService],
})
export class ChatModule {}
