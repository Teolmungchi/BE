import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class AuthLoginDto {
  @ApiProperty({
    description: '사용자 아이디 (영문 소문자 또는 숫자)',
    example: 'example1234',
  })
  @IsNotEmpty({ message: '아이디는 null이 될 수 없습니다.' })
  @IsString()
  @Length(4, 20, { message: '아이디는 4~20자리로 입력해주세요.' })
  @Matches(/^[a-z0-9]+$/, {
    message: '아이디는 영문 소문자 또는 숫자로만 이루어져야 합니다.',
  })
  @Expose({ name: 'userId' })
  userId: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'example123!@',
  })
  @IsNotEmpty({ message: '비밀번호는 null이 될 수 없습니다.' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{10,20}$/, {
    message:
      '비밀번호는 소문자 1개 이상, 숫자 1개 이상, 특수문자(!, @, #, %, $) 1개 이상으로 구성된 10~20자리 비밀번호로 입력해주세요.',
  })
  @Expose({ name: 'password' })
  password: string;
}
