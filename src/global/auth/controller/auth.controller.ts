import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../service/auth.service';
import { AuthSignUpDto } from '../dto/auth-sign-up.dto';
import { JwtTokenDto } from '../dto/jwt-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResponseDto } from '../../exception/dto/response.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommonException } from '../../exception/common-exception';
import { ErrorCode } from '../../exception/error-code';
import { AuthLoginDto } from '../dto/auth-login.dto';

@ApiTags('인증/인가')
@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @ApiOperation({ summary: '회원가입', description: '회원가입을 진행합니다.' })
  @ApiResponse({
    status: 200,
    description: '회원가입에 성공하였습니다.',
    schema: {
      example: {
        httpStatus: 201,
        success: true,
        data: null,
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @Post('sign-up')
  async signUp(
    @Body(new ValidationPipe({ transform: true })) authSignUpDto: AuthSignUpDto,
  ): Promise<ResponseDto<any>> {
    await this.authService.signUp(authSignUpDto);
    return ResponseDto.created(null);
  }

  @ApiOperation({ summary: '로그인', description: '로그인을 진행합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그인을 성공합니다.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken:
            'eyJhbGcywiZXhwIjoxNzQ0MzUzNjkzfQ.UF5b8mCa5mnvL9WK3Igx0Fc5vWzcSSTXdUuceGRpCX0',
          refreshToken:
            'eyJhbGciTc0NDM1MDA5MywiZXhwIjoxNzQ1NTU5NjkzfQ.ErOsYgzWtnwwXzmSfNr4R7Uj6wg5kWabSdkL0kVVkzY',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: '입력값이 올바르지 않습니다.' })
  @Post('login')
  async login(
    @Body(new ValidationPipe({ transform: true })) authLoginDto: AuthLoginDto,
    @Res() res: Response,
  ): Promise<any> {
    const jwtTokenDto: JwtTokenDto = await this.authService.login(authLoginDto);
    res.setHeader('x-refresh-token', jwtTokenDto.refreshToken);
    return res.json({ success: true, data: jwtTokenDto });
  }

  @ApiOperation({ summary: '로그아웃', description: '로그아웃을 진행합니다.' })
  @ApiResponse({
    status: 200,
    description: '로그아웃에 성공하였습니다.',
    schema: {
      example: {
        success: true,
        message: '로그아웃에 성공하였습니다.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않습니다.',
  })
  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
    if (!req.user) {
      throw new CommonException(ErrorCode.NOT_FOUND_LOGIN_USER);
    }
    const userId = req.user.id;
    await this.authService.logout(userId);
    return res.json({ success: true, message: '로그아웃에 성공하였습니다.' });
  }

  @ApiOperation({
    summary: '비밀번호 변경',
    description: '비밀번호 변경을 진행합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 수정에 성공하였습니다.',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Patch('password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true }))
    changePasswordDto: ChangePasswordDto,
  ): Promise<ResponseDto<any>> {
    if (!req.user) {
      throw new CommonException(ErrorCode.NOT_FOUND_LOGIN_USER);
    }
    const userId = req.user.id;
    await this.authService.changePassword(userId, changePasswordDto);
    return ResponseDto.ok(null);
  }

  @ApiOperation({
    summary: '토큰 재발급',
    description: '리프레시 토큰을 사용해 새로운 토큰을 발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '새로운 토큰 발급에 성공하였습니다.',
    schema: {
      example: {
        success: true,
        data: {
          accessToken:
            'eyJhbGciOiJIUzIiZXhwIjoxNzQ0MzU2Mzk2fQ.Q61B_zYDQpZ92BmqyTdwvippd2kdx7iR3afpRkCoRxs',
          refreshToken:
            'eyJhbGciOiJIUzI1NiIswiZXhwIjoxNzQ1NTYyMzk2fQ.5keoNz8vEiqx65vk18eVVbHSHvFTDwianTVbAvFDWa8',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'JWT 토큰이 없거나 유효하지 않음',
    schema: {
      example: {
        success: false,
        message: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('reissue')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async reissue(@Req() req: Request, @Res() res: Response): Promise<any> {
    // 헤더에서 리프레시 토큰을 읽어옵니다.
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new CommonException(ErrorCode.INVALID_TOKEN_ERROR);
    }
    try {
      const { userId } = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const jwtTokenDto: JwtTokenDto = await this.authService.reissue(
        userId,
        refreshToken,
      );
      res.setHeader('x-refresh-token', jwtTokenDto.refreshToken);
      return res.json({ success: true, data: jwtTokenDto });
    } catch (error) {
      throw new CommonException(ErrorCode.INVALID_TOKEN_ERROR);
    }
  }
}