import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { MatchService } from '../match.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { ResponseDto } from '../../../global/exception/dto/response.dto';

@ApiTags('매칭')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post(':feedId')
  @ApiOperation({ summary: '실종동물 매칭', description: '잃어버린 동물의 유사도를 기반으로 실종동물을 매칭합니다.' })
  async match(
    @Req() req,
    @Param('feedId') feedId: number,
    @Body('similarity') similarity: number,
  ): Promise<ResponseDto<any>> {
    const userId = req.user.id;
    const result = await this.matchService.createMatchingResult(feedId, similarity, userId);
    return ResponseDto.ok(result);
  }
}


