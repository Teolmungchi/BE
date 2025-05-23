import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MatchService } from '../match.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { Reports } from '../entity/reports.entity';

@ApiTags('매칭')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @ApiOperation({
    summary: '실종동물 매칭',
    description: '잃어버린 동물의 유사도를 기반으로 실종동물을 매칭합니다.',
  })
  @ApiBody({
    schema: {
      example: {
        similarity: 80,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '매칭 결과 반환',
    schema: {
      example: {
        httpStatus: 200,
        success: true,
        data: {
          message: '잃어버린 동물을 제보해주셨어요! 유사도 80%!',
          userId: 18,
        },
      },
    },
  })
  @Post()
  async matchBulk(
    @Req() req,
    @Body() body: { results: { feed_id: number; similarity_score: number }[] },
  ): Promise<ResponseDto<any>> {
    const authorId = req.user.id;
    const results = await this.matchService.createMatchingResultsBulk(
      authorId,
      body.results,
    );
    return ResponseDto.ok(results);
  }

  @ApiOperation({
    summary: '알림창 조회',
    description: '알림창 보관함에서 알림을 리스트로 가져옵니다.',
  })
  @Get()
  async getMyMatchingResults(@Req() req): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const results = await this.matchService.getSimilarities(userId);
    return ResponseDto.ok(results);
  }

  @ApiBody({
    schema: {
      example: {
        fileName: '1748003224684_30aac4be',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '신고 저장',
    schema: {
      example: {
        "httpStatus": 200,
        "success": true,
        "data": {
          "createdAt": "2025-05-23T03:31:31.000Z",
          "updatedAt": "2025-05-23T03:31:31.000Z",
          "id": 1,
          "author": {
            "id": 15
          },
          "fileName": "1748003224684_30aac4be"
        }
      },
    },
  })
  @ApiOperation({ summary: '신고 저장', description: '신고를 저장합니다.' })
  @Post('report')
  async saveReport(
    @Req() req,
    @Body() body: { fileName: string },
  ): Promise<ResponseDto<Reports>> {
    const userId = req.user.id;
    const results = await this.matchService.saveReport(userId, body);
    return ResponseDto.ok(results);
  }
}