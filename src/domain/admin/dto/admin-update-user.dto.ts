import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, IsOptional, IsIn, IsInt } from 'class-validator';
import { Role } from '../../users/entity/role.enum';

export class AdminUpdateUserDto {
  @ApiProperty({ description: '닉네임', example: '수민띵', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[가-힣a-zA-Z]{2,20}$/, {
    message: '닉네임은 한글 또는 영어로 이루어진 2~20자리 문자열이어야 합니다.',
  })
  @Expose({ name: 'name' })
  name?: string;

  @ApiProperty({ description: '시리얼 아이디', example: 'user123', required: false })
  @IsOptional()
  @IsString()
  serial_id?: string;

  @ApiProperty({ description: '로그인 여부', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: 'is_login은 0 또는 1이어야 합니다.' })
  is_login?: boolean;

  @ApiProperty({ description: '권한', example: 'user', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['user', 'admin'], { message: 'role은 user 또는 admin만 가능합니다.' })
  role?: Role;
}
