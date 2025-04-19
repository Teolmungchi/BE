import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../schema/chat-message.schema';
import { ChatRoomRepository } from '../repository/chat-room.repository';
import { User } from '../../users/entity/user.entity';
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { ChatRoom } from '../entity/chat-room.entity';
import { SendMessageDto } from '../dto/send-message.dto';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    private readonly chatRoomRepository: ChatRoomRepository,
  ) {}

  async createChatRoom(user1: User, dto: CreateChatRoomDto): Promise<ChatRoom> {
    if (user1.id === dto.user2Id) {
      throw new CommonException(ErrorCode.SAME_USER);
    }

    let chatRoom = await this.chatRoomRepository.findByUsers(
      user1.id,
      dto.user2Id,
    );
    if (chatRoom) {
      return chatRoom;
    }

    chatRoom = this.chatRoomRepository.create({
      user1Id: user1.id,
      user2Id: dto.user2Id,
    });
    return this.chatRoomRepository.save(chatRoom);
  }

  async getChatRoom(id: number): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['user1', 'user2'],
    });
    if (!chatRoom) {
      throw new CommonException(ErrorCode.NOT_FOUND_CHAT_ROOM);
    }
    return chatRoom;
  }

  async getChatRoomsForUser(userId: number): Promise<ChatRoom[]> {
    return this.chatRoomRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
    });
  }

  async createMessage(
    dto: SendMessageDto,
    senderId: number,
  ): Promise<ChatMessage> {
    const chatRoom = await this.getChatRoom(dto.chatRoomId);
    if (chatRoom.user1Id !== senderId && chatRoom.user2Id !== senderId) {
      throw new CommonException(ErrorCode.NOT_IN_CHAT_ROOM);
    }
    const receiverId =
      chatRoom.user1Id === senderId ? chatRoom.user2Id : chatRoom.user1Id;

    const chatMessage = new this.chatMessageModel({
      message: dto.message,
      senderId: senderId.toString(),
      receiverId: receiverId.toString(),
      chatRoomId: dto.chatRoomId.toString(),
      createdAt: new Date(),
    });
    return chatMessage.save();
  }

  async getMessages(
    chatRoomId: number,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    return this.chatMessageModel
      .find({ chatRoomId: chatRoomId.toString() })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}
