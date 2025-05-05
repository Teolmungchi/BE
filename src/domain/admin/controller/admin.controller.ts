import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
import { UserActivityStatDto } from '../dto/user-activity-stat.dto';
import { MatchingStatDto } from '../dto/matching-stat.dto';
import { RecentAnimalDto } from '../dto/recent-animal.dto';

@ApiTags('관리자')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계', description: '총 사용자, 실종/발견 신고 건수, 전월 대비 증감율 제공' })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboard();
  }

  @Get('activity')
  @ApiOperation({ summary: '유저 활동 통계', description: '날짜별 활성 사용자, 신규 가입, 실종/발견 신고 건수 제공' })
  @ApiQuery({ name: 'startDate', required: true, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'endDate', required: true, description: 'YYYY-MM-DD' })
  async getUserActivityStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<UserActivityStatDto[]> {
    return this.adminService.getUserActivity(startDate, endDate);
  }

  // @Get('matching')
  // @ApiOperation({ summary: '매칭 통계', description: '월별 매칭 성공/실패 건수 제공' })
  // @ApiQuery({ name: 'month', required: true, description: 'YYYY-MM 형식의 월' })
  // async getMatchingStats(@Query('month') month: string): Promise<MatchingStatDto> {
  //   return this.adminService.getMatch(month);
  // }

  @Get('recent')
  @ApiOperation({ summary: '최근 등록 동물', description: '가장 최근 등록된 동물 5개 반환' })
  async getRecentAnimals(): Promise<RecentAnimalDto[]> {
    return this.adminService.getRecentAnimals();
  }
}