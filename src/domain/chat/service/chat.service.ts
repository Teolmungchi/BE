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

  async getChatRoomsForUser(userId: number): Promise<any[]> {
    const rooms = await this.chatRoomRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
    });
    return rooms.map((room) => ({
      id: room.id,
      user1Id: room.user1Id,
      user2Id: room.user2Id,
      user1: room.user1,
      user2: room.user2,
      unreadCount:
        room.user1Id === userId ? room.user1UnreadCount : room.user2UnreadCount,
      lastMessage: room.lastMessage,
      lastMessageAt: room.lastMessageAt,
      lastMessageAgo: room.lastMessageAt ? getTimeAgoString(room.lastMessageAt) : null,
    }));
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
    await chatMessage.save();

    if (senderId === chatRoom.user1Id) {
      chatRoom.user2UnreadCount += 1;
    } else {
      chatRoom.user1UnreadCount += 1;
    }
    chatRoom.lastMessage = dto.message;
    chatRoom.lastMessageAt = new Date();
    await this.chatRoomRepository.save(chatRoom);

    return chatMessage;
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

  async readChatRoom(userId: number, chatRoomId: number): Promise<void> {
    const chatRoom = await this.getChatRoom(chatRoomId);
    if (chatRoom.user1Id === userId) {
      chatRoom.user1UnreadCount = 0;
    } else if (chatRoom.user2Id === userId) {
      chatRoom.user2UnreadCount = 0;
    }
    await this.chatRoomRepository.save(chatRoom);
  }

}
function getTimeAgoString(lastMessageAt: Date) : string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(lastMessageAt).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return '1분 전 미만';
  } else if (minutes < 60) {
    return `${minutes}분 전`;
  } else {
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}일 전`;
    }
  }
}