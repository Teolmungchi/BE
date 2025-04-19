import { ChatService } from '../service/chat.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { ChatRoom } from '../entity/chat-room.entity';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ChatMessage } from '../schema/chat-message.schema';

@ApiTags('채팅')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({
    status: 201,
    description: '채팅방 생성 완료',
    schema: {
      example: {
        createdAt: '2025-04-17T22:08:27.000Z',
        updatedAt: '2025-04-17T22:08:27.000Z',
        id: 4,
        user1Id: 11,
        user2Id: 12,
        user1: {
          createdAt: '2025-04-15T20:16:52.000Z',
          updatedAt: '2025-04-17T22:07:36.000Z',
          id: 11,
          serialId: 'sumin11@gachon.ac.kr',
          password:
            '$2b$10$/NES39Bi/naW4C4UapWCRu13nxtC8NETIDgD.fCmCr/4FGwwFKvaG',
          isLogin: true,
          refreshToken:
            'eyJhbGciOiJIUzImV4cCI6MTc0NjE2OTY1Nn0TgGbE5td4COPzPfKzs',
          name: '수민띵',
        },
        user2: {
          createdAt: '2025-04-17T21:12:10.000Z',
          updatedAt: '2025-04-17T21:12:10.000Z',
          id: 12,
          serialId: 'sonsumin11@naver.com',
          password:
            '$2b$10$qB4Qto5vCIGPs8lgHw.Vlu4RQfektmHd9T0wQwMoN5msBgM1BAG7u',
          isLogin: false,
          refreshToken: null,
          name: '괜찮아띵띵',
        },
      },
    },
  })
  @Post('room')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async createChatRoom(
    @Req() req,
    @Body() dto: CreateChatRoomDto,
  ): Promise<ChatRoom> {
    return this.chatService.createChatRoom(req.user, dto);
  }

  @ApiOperation({ summary: '유저의 모든 채팅방 조회' })
  @ApiResponse({
    status: 200,
    description: '모든 채팅방 조회',
    schema: {
      example: [
        {
          createdAt: '2025-04-17T02:50:26.000Z',
          updatedAt: '2025-04-17T02:50:26.000Z',
          id: 3,
          user1Id: 11,
          user2Id: 8,
          user1: {
            createdAt: '2025-04-15T20:16:52.000Z',
            updatedAt: '2025-04-17T22:07:36.000Z',
            id: 11,
            serialId: 'sumin11@gachon.ac.kr',
            password:
              '$2b$10$/NES39Bi/naW4C4UapWCRu13nxtC8NETIDgD.fCmCr/4FGwwFKvaG',
            isLogin: true,
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInqFTgGbE5td4COPzPfKzs',
            name: '수민띵',
          },
          user2: {
            createdAt: '2025-04-10T21:12:14.000Z',
            updatedAt: '2025-04-15T20:13:08.000Z',
            id: 8,
            serialId: 'sumin2201',
            password:
              '$2b$10$pPmBqYQnUu8.dVamgB6N9O19HiVSrD/pzFNJx22a1sVz0GFZ.mOMa',
            isLogin: true,
            refreshToken:
              'eyJhjoxNzQ1OTg5OTg4fQ.3Pa8DzRRgeAe2OFZeR_5M07SGT0e7X0',
            name: '괜찮아딩딩딩딩딩',
          },
        },
        {
          createdAt: '2025-04-17T22:08:27.000Z',
          updatedAt: '2025-04-17T22:08:27.000Z',
          id: 4,
          user1Id: 11,
          user2Id: 12,
          user1: {
            createdAt: '2025-04-15T20:16:52.000Z',
            updatedAt: '2025-04-17T22:07:36.000Z',
            id: 11,
            serialId: 'sumin11@gachon.ac.kr',
            password:
              '$2b$10$/NES39Bi/naW4C4UapWCRu13nxtC8NETIDgD.fCmCr/4FGwwFKvaG',
            isLogin: true,
            refreshToken:
              'eyJhbc0NjE2OTY1aaSDe7k--DUidqFTgGbE5td4COPzPfKzs',
            name: '수민띵',
          },
          user2: {
            createdAt: '2025-04-17T21:12:10.000Z',
            updatedAt: '2025-04-17T21:12:10.000Z',
            id: 12,
            serialId: 'sonsumin11@naver.com',
            password:
              '$2b$10$qB4Qto5vCIGPs8lgHw.Vlu4RQfektmHd9T0wQwMoN5msBgM1BAG7u',
            isLogin: false,
            refreshToken: null,
            name: '괜찮아띵띵',
          },
        },
      ],
    },
  })
  @Get('rooms')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getChatRooms(@Req() req): Promise<ChatRoom[]> {
    return this.chatService.getChatRoomsForUser(req.user.id);
  }

  @ApiOperation({ summary: '채팅방 메시지 조회' })
  @ApiResponse({
    status: 200,
    description: '메시지 조회',
    type: [ChatMessage],
    schema: {
      example: [
        {
          _id: '680326ea5e82ee4521b3a084',
          message: '반가와요',
          senderId: '11',
          receiverId: '8',
          chatRoomId: '3',
          createdAt: '2025-04-19T04:30:34.736Z',
          __v: 0,
        },
        {
          _id: '680326945e82ee4521b3a081',
          message: '안녕하세요!',
          senderId: '11',
          receiverId: '8',
          chatRoomId: '3',
          createdAt: '2025-04-19T04:29:08.496Z',
          __v: 0,
        },
      ],
    },
  })
  @Get('room/:id/messages')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id') chatRoomId: number,
    @Query('limit') limit: number = 50,
  ): Promise<ChatMessage[]> {
    return this.chatService.getMessages(chatRoomId, limit);
  }
}
