import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: '채팅방 ID' })
  @IsInt()
  chatRoomId: number;

  @ApiProperty({ description: '메시지 내용'})
  @IsString()
  @MinLength(1)
  message: string;
}
