import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Expose } from 'class-transformer';

export class ChangePasswordDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: '12345a!',
  })
  @IsNotEmpty({ message: '비밀번호는 null이 될 수 없습니다.' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{10,20}$/, {
    message:
      '비밀번호는 소문자 1개 이상, 숫자 1개 이상, 특수문자(!, @, #, %, $) 1개 이상으로 구성된 10~20자리 비밀번호로 입력해주세요.',
  })
  @Expose({ name: 'currentPassword' })
  currentPassword: string;

  @ApiProperty({
    description: '현재 비밀번호',
    example: '12345a!',
  })
  @IsNotEmpty({ message: '비밀번호는 null이 될 수 없습니다.' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%]).{10,20}$/, {
    message:
      '비밀번호는 소문자 1개 이상, 숫자 1개 이상, 특수문자(!, @, #, %, $) 1개 이상으로 구성된 10~20자리 비밀번호로 입력해주세요.',
  })
  @Expose({ name: 'newPassword' })
  newPassword: string;
}
