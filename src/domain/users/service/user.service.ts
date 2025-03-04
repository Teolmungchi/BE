import { Injectable, NotFoundException, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { UserRepository } from '../repository/user.repository';
import { UsersDto } from '../dto/users.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';

@Injectable()
@UseFilters(HttpExceptionFilter)
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserInfo(userId: number): Promise<UsersDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }
    return UsersDto.fromEntity(user);
  }

  async updateUserInfo(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UsersDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }
    // 유저 정보 업데이트 (예: name만 업데이트)
    user.name =
      updateUserDto.name !== undefined ? updateUserDto.name : user.name;

    // 저장 후 업데이트된 정보를 반환
    const updatedUser = await this.userRepository.save(user);
    return UsersDto.fromEntity(updatedUser);
  }
}