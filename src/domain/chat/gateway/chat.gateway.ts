import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../service/chat.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { validate } from 'class-validator';
import { AuthService } from '../../../global/auth/service/auth.service';
import { JoinRoomDto } from '../dto/join-room.dto';
import { SendMessageDto } from '../dto/send-message.dto';
import { plainToInstance } from 'class-transformer';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawHeader = client.handshake.headers.authorization;
      this.logger.log(`Raw authorization header: ${rawHeader}`);
      const token =
        client.handshake.query.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '') ||
        client.handshake.auth?.token;
      this.logger.log(`추출된 토큰: ${token}`);
      if (!token) {
        throw new BadRequestException('토큰이 없습니다.');
      }
      const payload = await this.authService.parseBearerToken(token, true);
      client.data.user = {
        ...payload,
        id: payload.userId,
      };
      this.logger.log(
        `연결 성공: ${client.id}, User: ${payload.sub || payload.id}`,
      );
      client.emit('connectSuccess', { userId: payload.sub || payload.id });
    } catch (error) {
      this.logger.error(`인증 실패: ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || '인증실패' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 종료: ${client.id}`);
  }

  @SubscribeMessage('receiveMessage')
  async receiveMessage(
    @MessageBody() data: { message: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('receiveMessage', data);
    console.log(client);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return client.emit('error', { message: 'Unauthorized' });
    }
    this.logger.log(`dto: ${JSON.stringify(data)}`);

    try {
      const dtoInstance = plainToInstance(JoinRoomDto, data);
      const errors = await validate(dtoInstance);
      if (errors.length > 0) {
        return client.emit('error', { message: 'Invalid chat room ID' });
      }

      const chatRoom = await this.chatService.getChatRoom(data.chatRoomId);
      this.logger.log(`user.id:` + user.id);
      this.logger.log(`chatRoom-user1:` + chatRoom.user1.id);
      this.logger.log(`chatRoom-user2:` + chatRoom.user2.id);

      if (chatRoom.user1.id !== user.id && chatRoom.user2.id !== user.id) {
        return client.emit('error', {
          message: 'Not authorized for this chat room',
        });
      }

      client.join(`room_${data.chatRoomId}`);
      client.emit('joinedRoom', { chatRoomId: data.chatRoomId });
      this.logger.log(`User ${user.id} joined room ${data.chatRoomId}`);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) {
      return client.emit('error', { message: 'Unauthorized' });
    }

    try {
      const doInstance = plainToInstance(SendMessageDto, data);
      const errors = await validate(doInstance);
      if (errors.length > 0) {
        return client.emit('error', { message: 'Invalid message data' });
      }

      const chatMessage = await this.chatService.createMessage(data, user.id);
      this.server.to(`room_${data.chatRoomId}`).emit('newMessage', {
        id: chatMessage._id,
        message: chatMessage.message,
        senderId: chatMessage.senderId,
        receiverId: chatMessage.receiverId,
        chatRoomId: chatMessage.chatRoomId,
        createdAt: chatMessage.createdAt,
      });
      this.logger.log(
        `Message sent in room ${data.chatRoomId} by user ${user.id}`,
      );
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
