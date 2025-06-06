import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class AuthLoginDto {
  @ApiProperty({
    description: '사용자 이메일 아이디',
    example: 'sumin111@gachon.ac.kr',
  })
  @IsNotEmpty({ message: '이메일 아이디는 null이 될 수 없습니다.' })
  @IsEmail({}, { message: '유효한 이메일 형식이 아닙니다.' })
  @Length(4, 50, { message: '이메일 아이디는 4~50자리로 입력해주세요.' })
  @Expose({ name: 'userId' })
  userId: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'example123!@',
  })
  @IsNotEmpty({ message: '비밀번호는 null이 될 수 없습니다.' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{8,20}$/, {
    message:
      '비밀번호는 소문자 1개 이상, 숫자 1개 이상, 특수문자(!, @, #, %, $) 1개 이상으로 구성된 8~20자리 비밀번호로 입력해주세요.',
  })
  @Expose({ name: 'password' })
  password: string;
}
