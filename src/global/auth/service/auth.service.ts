import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../exception/filter/http-exception.filter';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../domain/users/repository/user.repository';
import { CommonException } from '../../exception/common-exception';
import { ErrorCode } from '../../exception/error-code';
import { AuthSignUpDto } from '../dto/auth-sign-up.dto';
import { JwtTokenDto } from '../dto/jwt-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { AuthLoginDto } from '../dto/auth-login.dto';
import { Role } from '../../../domain/users/entity/role.enum';

@Injectable()
@UseFilters(HttpExceptionFilter)
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async signUp(authSignUpDto: AuthSignUpDto): Promise<void> {
    const hashedPassword = await bcrypt.hash(authSignUpDto.password, 10);
    await this.userRepository.save({
      serialId: authSignUpDto.userId,
      password: hashedPassword,
      name: authSignUpDto.name,
      role: Role.USER,
    });
  }

  async login(authLoginDto: AuthLoginDto): Promise<JwtTokenDto> {
    const user = await this.userRepository.findOne({
      where: { serialId: authLoginDto.userId },
    });

    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const isPasswordValid = await bcrypt.compare(
      authLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CommonException(ErrorCode.FAILURE_LOGIN);
    }

    const tokens = this.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    user.isLogin = true;
    await this.userRepository.save(user);

    return JwtTokenDto.of(tokens.accessToken, tokens.refreshToken, user.id)
  }

  async logout(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refreshToken = null;
      user.isLogin = false;
      await this.userRepository.save(user);
    }
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CommonException(ErrorCode.FAILURE_CHANGE_PASSWORD);
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }

  async reissue(userId: number, refreshToken: string): Promise<JwtTokenDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, refreshToken, isLogin: true },
    });

    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_LOGIN_USER);
    }

    const tokens = this.generateTokens(user.id);
    user.refreshToken = tokens.refreshToken;
    await this.userRepository.save(user);

    return JwtTokenDto.of(tokens.accessToken, tokens.refreshToken, user.id);
  }

  private generateTokens(userId: number): JwtTokenDto {
    const payload = { userId };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' }); // accessToken 1시간 유효
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '14d' }); // refreshToken 14일 유효

    return JwtTokenDto.of(accessToken, refreshToken, userId)
  }

  async parseBearerToken(
    rawToken: string | undefined,
    strict: boolean,
  ): Promise<any> {
    this.logger.log(`Raw token: ${rawToken}`);
    if (!rawToken) {
      if (strict) {
        throw new CommonException(ErrorCode.INVALID_TOKEN_ERROR);
      }
      return null;
    }

    const token = rawToken;

    if (strict && token.split('.').length !== 3) {
      throw new CommonException(ErrorCode.TOKEN_MALFORMED_ERROR);
    }

    try {
      this.logger.log(`Verifying token with secret: ${process.env.JWT_SECRET}`);
      const startTime = Date.now();
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-jwt-secret',
      });
      this.logger.log(`Token verification took ${Date.now() - startTime}ms`);
      this.logger.log(`Token payload: ${JSON.stringify(payload)}`);
      return payload;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      if (strict) {
        throw new CommonException(ErrorCode.INVALID_TOKEN_ERROR);
      }
      return null;
    }
  }
}