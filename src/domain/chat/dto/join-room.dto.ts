import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class JoinRoomDto {
  @ApiProperty({ description: '채팅방ID' })
  @IsInt()
  chatRoomId: number;
}