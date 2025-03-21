import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class LikeDto {
  @ApiProperty({
    description: '좋아요할 피드의 id',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  feedId: number;
}