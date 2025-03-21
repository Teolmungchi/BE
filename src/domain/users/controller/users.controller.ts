import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseInterceptor } from '../../../global/common/interceptor/response.interceptor';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { UserService } from '../service/user.service';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('유저')
@Controller('api/v1/user')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: '유저 정보 조회',
    description: '로그인된 유저의 정보를 가져옵니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '유저 정보 반환 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const userInfo = ResponseDto.ok(await this.userService.getUserInfo(userId));
    return ResponseDto.ok(userInfo);
  }

  @ApiOperation({
    summary: '유저 정보 수정',
    description: '로그인된 유저의 정보를 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '유저 정보 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Put()
  @UseGuards(JwtAuthGuard)
  async updateUserInfo(
    @Req() req,
    @Body(new ValidationPipe({ transform: true }))
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const updateUser = await this.userService.updateUserInfo(
      userId,
      updateUserDto,
    );
    return ResponseDto.ok(updateUser);
  }
}
