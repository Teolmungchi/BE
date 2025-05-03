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

@ApiTags('관리자')
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계', description: '총 사용자, 실종/발견 신고 건수, 전월 대비 증감율 제공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getDashboardStats(@Req() req) {
    return this.adminService.getDashboard();
  }


  @Get('activity')
  @ApiOperation({ summary: '유저 활동 통계', description: '날짜별 활성 사용자, 신규 가입, 실종/발견 신고 건수 제공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getUserActivityStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.adminService.getUserActivity(startDate, endDate);
  }


  @Get('match')
  @ApiOperation({ summary: '매칭 통계', description: '월별 매칭 성공/실패 건수 제공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'month', required: true, description: 'YYYY-MM 형식의 월' })
  async getMatchingStats(@Query('month') month: string) {
    return this.adminService.getMatch(month);
  }


  @Get('recent')
  @ApiOperation({ summary: '최근 등록 동물', description: '가장 최근 등록된 동물 5개 반환' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getRecentAnimals() {
    return this.adminService.getRecentAnimals();
  }
}
