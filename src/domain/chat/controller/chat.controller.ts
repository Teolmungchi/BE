import { ChatService } from '../service/chat.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CreateChatRoomDto } from '../dto/create-chat-room.dto';
import { ChatRoom } from '../entity/chat-room.entity';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ChatMessage } from '../schema/chat-message.schema';

@ApiTags('chat')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({ status: 201, description: '채팅방 생성 완료', type: ChatRoom })
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
    type: [ChatRoom],
  })
  @Get('rooms')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getChatRooms(@Req() req): Promise<ChatRoom[]> {
    return this.chatService.getChatRoomsForUser(req.user.id);
  }

  @ApiOperation({ summary: '채팅방 메시지 조회' })
  @ApiResponse({ status: 200, description: '메시지 조회', type: [ChatMessage] })
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
