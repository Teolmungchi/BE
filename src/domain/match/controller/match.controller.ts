import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MatchService } from '../match.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ResponseDto } from '../../../global/exception/dto/response.dto';

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
    @Body() body: { results: { feed_id: number; authorId: number; similarity_score: number }[] }
  ): Promise<ResponseDto<any>> {
    const results = await this.matchService.createMatchingResultsBulk(body.results);
    return ResponseDto.ok(results);
  }
}


