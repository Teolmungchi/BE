import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller, Delete, Get,
  Param, ParseIntPipe,
  Post, Put, Query,
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
import { Feed } from '../entity/feed.entity';
import { FeedResponseDto } from '../dto/feed-response.dto';

@ApiTags('피드(게시판)')
@Controller('api/v1/feed')
@UseInterceptors(ResponseInterceptor)
@UseFilters(HttpExceptionFilter)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({
    summary: '모든 피드(게시글) 조회',
    description: '모든 피드(게시글)을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '피드(게시글) 조회 성공',
    schema: {
      example: {
        "httpStatus": 200,
        "success": true,
        "data": [
          {
            "id": 51,
            "title": "발견 강아지",
            "content": "생성할 피드(게시글) 내용.",
            "fileName": "sdlfmalsas-asdd",
            "lostDate": "2025-05-13",
            "lostPlace": "가천대학교 AI공학관",
            "placeFeature": "정문에서 제일 멀어요",
            "dogType": "말라뮤트",
            "dogAge": 7,
            "dogGender": "남자",
            "dogColor": "흰색",
            "dogFeature": "빨간색 목걸이를 하고 있어요",
            "likesCount": 0,
            "createdAt": "2025-05-14T01:13:33.000Z",
            "updatedAt": "2025-05-14T01:13:33.000Z",
            "author": {
              "id": 15,
              "name": "수민띵"
            }
          }
        ]
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
  @Get('all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getAllFeeds(@Req() req): Promise<ResponseDto<FeedResponseDto[]>> {
    const feeds = await this.feedService.getAllFeeds();
    return ResponseDto.ok(feeds);
  }

  @ApiOperation({
    summary: '피드 생성',
    description: '피드(게시글)을 생성합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '피드(게시글) 생성 성공',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: {
          id: 6,
          author: {
            id: 8,
          },
          title: '생성할 피드(게시글) 제목.',
          content: '생성할 피드(게시글) 내용.',
          imageUrl: 'https://minio.example.com/bucket/1616161616_abcd',
          lostDate: '2025-05-07',
          lostPlace: '가천대학교 AI공학관',
          placeFeature: '정문에서 제일 멀어요',
          dogType: '말티즈',
          dogAge: 7,
          dogGender: '남자',
          dogColor: '흰색',
          dogFeature: '빨간색 목걸이를 하고 있어요',
          likesCount: 0,
          createdAt: '2025-04-10T21:27:27.365Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '피드 생성 실패',
    schema: {
      example: {
        success: false,
        message: ['사진은 한 장 이상 올리세요'],
        error: 'Bad Request',
        statusCode: 400,
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
  @ApiResponse({
    status: 200,
    description: '피드(게시글) 수정 완료',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: {
          id: 6,
          author: {
            id: 8,
            serialId: 'sumin2201',
            password:
              '$2b$10$pPmBqYQnUu8.dVamgB6N9O19HiVSrD/pzFNJx22a1sVz0GFZ.mOMa',
            isLogin: true,
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTc0NDM1Mjc5NiwiZXhwIjoxNzQ1NTYyMzk2fQ.5keoNz8vEiqx65vk18eVVbHSHvFTDwianTVbAvFDWa8',
            name: '수민띵',
            createdAt: '2025-04-10T21:12:14.000Z',
            updatedAt: '2025-04-10T21:26:36.000Z',
          },
          title: '수정할 제목',
          content: '수정할 컨텐츠 내용',
          imageUrl: 'https://minio.example.com/bucket/1616161616_abcd',
          lostDate: '2025-05-07',
          lostPlace: '가천대학교 AI공학관',
          placeFeature: '정문에서 제일 멀어요',
          dogType: '말티즈',
          dogAge: 7,
          dogGender: '남자',
          dogColor: '흰색',
          dogFeature: '빨간색 목걸이를 하고 있어요',
          likesCount: 0,
          createdAt: '2025-04-10T21:27:27.365Z',
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
  @ApiResponse({
    status: 200,
    description: '피드 조회 성공',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: {
          id: 5,
          author: {
            id: 6,
            serialId: 'example1234',
            password:
              '$2b$10$sbzOiWZRxrKHEevoDS/jiO/e2yx20I6N6d0cyEkH0UYRY0OREIYUa',
            isLogin: true,
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsImlhdCI6MTc0NDI4OTUyOCwiZXhwIjoxNzQ1NDk5MTI4fQ.y48YT3-vGVfx7j_Q82pXJY2btdp8m8m1nAu_qryomIw',
            name: '수민띵',
            createdAt: '2025-04-10T02:50:17.000Z',
            updatedAt: '2025-04-10T03:52:08.000Z',
          },
          title: '생성할 피드(게시글) 제목.',
          content: '생성할 피드(게시글) 내용.',
          imageUrl: 'https://minio.example.com/bucket/1616161616_abcd',
          lostDate: '2025-05-07',
          lostPlace: '가천대학교 AI공학관',
          placeFeature: '정문에서 제일 멀어요',
          dogType: '말티즈',
          dogAge: 7,
          dogGender: '남자',
          dogColor: '흰색',
          dogFeature: '빨간색 목걸이를 하고 있어요',
          likesCount: 0,
          createdAt: '2025-04-10T02:51:40.279Z',
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
    summary: '내가 작성한 모든 피드(게시글) 조회',
    description: '내가 작성한 모든 피드(게시글)을 조회합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '모든 피드(게시글) 조회 성공',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: [
          {
            id: 7,
            author: {
              id: 8,
              serialId: 'sumin2201',
              password:
                '$2b$10$pPmBqYQnUu8.dVamgB6N9O19HiVSrD/pzFNJx22a1sVz0GFZ.mOMa',
              isLogin: true,
              refreshToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTc0NDM1Mjc5NiwiZXhwIjoxNzQ1NTYyMzk2fQ.5keoNz8vEiqx65vk18eVVbHSHvFTDwianTVbAvFDWa8',
              name: '수민띵',
              createdAt: '2025-04-10T21:12:14.000Z',
              updatedAt: '2025-04-10T21:26:36.000Z',
            },
            title: '생성할 피드(게시글) 제목.',
            content: '생성할 피드(게시글) 내용.',
            imageUrl: 'https://minio.example.com/bucket/1616161616_abcd',
            lostDate: '2025-05-07',
            lostPlace: '가천대학교 AI공학관',
            placeFeature: '정문에서 제일 멀어요',
            dogType: '말티즈',
            dogAge: 7,
            dogGender: '남자',
            dogColor: '흰색',
            dogFeature: '빨간색 목걸이를 하고 있어요',
            likesCount: 0,
            createdAt: '2025-04-10T21:47:03.220Z',
          },
          {
            id: 8,
            author: {
              id: 8,
              serialId: 'sumin2201',
              password:
                '$2b$10$pPmBqYQnUu8.dVamgB6N9O19HiVSrD/pzFNJx22a1sVz0GFZ.mOMa',
              isLogin: true,
              refreshToken:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImlhdCI6MTc0NDM1Mjc5NiwiZXhwIjoxNzQ1NTYyMzk2fQ.5keoNz8vEiqx65vk18eVVbHSHvFTDwianTVbAvFDWa8',
              name: '수민띵',
              createdAt: '2025-04-10T21:12:14.000Z',
              updatedAt: '2025-04-10T21:26:36.000Z',
            },
            title: '생성할 피드(게시글) 제목.',
            content: '생성할 피드(게시글) 내용.',
            imageUrl: 'https://minio.example.com/bucket/1616161616_abcd',
            lostDate: '2025-05-07',
            lostPlace: '가천대학교 AI공학관',
            placeFeature: '정문에서 제일 멀어요',
            dogType: '말티즈',
            dogAge: 7,
            dogGender: '남자',
            dogColor: '흰색',
            dogFeature: '빨간색 목걸이를 하고 있어요',
            likesCount: 0,
            createdAt: '2025-04-10T21:47:03.897Z',
          },
        ],
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
  @Get()
  @UseGuards(JwtAuthGuard)
  async getFeeds(@Req() req): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const feeds = await this.feedService.getFeeds(userId);
    return ResponseDto.ok(feeds);
  }



  @ApiOperation({
    summary: '피드(게시글) 삭제',
    description: '피드(게시글)을 삭제합니다.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '피드(게시글) 삭제 성공',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: {
          message: '피드(게시글) 삭제 성공',
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

