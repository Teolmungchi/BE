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

  @Post()
  async matchBulk(
    @Req() req,
    @Body() body: { results: { feed_id: number; authorId: number; similarity_score: number }[] }
  ): Promise<ResponseDto<any>> {
    const results = await this.matchService.createMatchingResultsBulk(body.results);
    return ResponseDto.ok(results);
  }
}


