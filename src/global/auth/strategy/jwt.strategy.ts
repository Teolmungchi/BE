import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../../domain/users/repository/user.repository';
import { CommonException } from '../../exception/common-exception';
import { ErrorCode } from '../../exception/error-code';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const { userId } = payload;
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    return user;
  }
}