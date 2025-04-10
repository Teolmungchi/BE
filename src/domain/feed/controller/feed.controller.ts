import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller, Delete, Get,
  Param, ParseIntPipe,
  Post, Put,
  Req,
  UseFilters,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseInterceptor } from '../../../global/common/interceptor/response.interceptor';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { FeedService } from '../service/feed.service';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';

@ApiTags('피드(게시판)')
@Controller('api/v1/feed')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({
    summary: '피드 생성',
    description: '피드(게시글)을 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '피드(게시글) 생성 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async createFeed(
    @Req() req,
    @Body(new ValidationPipe({ transform: true })) createFeedDto: CreateFeedDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const feed = await this.feedService.createFeed(userId, createFeedDto);
    return ResponseDto.ok(feed);
  }

  @ApiOperation({
    summary: '피드(게시글)을 수정합니다.',
    description: '피드(게시글)을 수정합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '피드(게시글) 수정 완료' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFeed(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateFeedDto: UpdateFeedDto,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const updateFeed = await this.feedService.updateFeedById(
      userId,
      id,
      updateFeedDto,
    );
    return ResponseDto.ok(updateFeed);
  }

  @ApiOperation({
    summary: '특정 피드(게시글) 조회',
    description: 'id 값으로 특정 피드(게시글)을 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '피드 조회 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFeed(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const feed = await this.feedService.getFeedById(userId, id);
    return ResponseDto.ok(feed);
  }

  @ApiOperation({
    summary: '모든 피드(게시글) 조회',
    description: '모든 피드(게시글)을 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '모든 피드(게시글) 조회 성공' })
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeeds(@Req() req): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const feeds = await this.feedService.getFeeds(userId);
    return ResponseDto.ok(feeds);
  }

  @ApiOperation({
    summary: '피드(게시글) 삭제',
    description: '피드(게시글)을 삭제합니다.'
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: '피드(게시글) 삭제 성공'})
  @ApiResponse({ status: 401, description: 'JWT 토큰이 없거나 유효하지 않음' })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFeed(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    await this.feedService.deleteFeedById(userId, id);
    return ResponseDto.ok({ message: '피드(게시글) 삭제 성공' });
  }
}

