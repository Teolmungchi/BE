import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ResponseInterceptor } from '../../../global/common/interceptor/response.interceptor';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { LikeService } from '../service/like.service';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';

@ApiTags('좋아요')
@Controller('api/v1/like')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({
    summary: '피드(게시글) 좋아요',
    description: '피드(게시글)에 좋아요 누르기',
  })
  @ApiResponse({ status: 200, description: '피드(게시글) 좋아요 누르기 성공', })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Post(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async likeFeed(
    @Req() req,
    @Param('id', ParseIntPipe) feedId: number,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const like = await this.likeService.likeFeed(userId, feedId);
    return ResponseDto.ok({ like });
  }

  @ApiOperation({
    summary: '피드(게시글) 좋아요 취소',
    description: '피드(게시글) 좋아요 취소하기',
  })
  @ApiResponse({ status: 200, description: '피드(게시글) 좋아요 취소 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async cancelLike(
    @Req() req,
    @Param('id', ParseIntPipe) feedId: number,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const cancelLike = await this.likeService.unlikeFeed(userId, feedId);
    return ResponseDto.ok({ cancelLike, message: '좋아요 취소 성공' });
  }
}
