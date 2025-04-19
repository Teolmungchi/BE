import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateChatRoomDto {
  @ApiProperty({ description: '채팅방에 들어오셨습니다.' })
  @IsInt()
  user2Id: number;
}
