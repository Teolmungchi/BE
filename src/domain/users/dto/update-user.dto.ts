import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UpdateUserDto {

  @ApiProperty({
    description: '닉네임',
    example: '수민띵',
  })
  @IsNotEmpty({ message: '닉네임은 null이 될 수 없습니다.' })
  @IsString()
  @Matches(/^[가-힣a-zA-Z]{2,20}$/, {
    message: '닉네임은 한글 또는 영어로 이루어진 2~20자리 문자열이어야 합니다.',
  })
  @Expose({ name: 'name' })
  name: string;
}
