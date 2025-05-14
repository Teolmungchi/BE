import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req, Delete, Param, Put, Body, ValidationPipe,
} from '@nestjs/common';
import { AdminService } from '../admin.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../global/common/guards/jwt-auth.guard';
import { DashboardStatsDto } from '../dto/dashboard-stats.dto';
import { UserActivityStatDto } from '../dto/user-activity-stat.dto';
import { MatchingStatDto } from '../dto/matching-stat.dto';
import { RecentAnimalDto } from '../dto/recent-animal.dto';
import { UserListDto } from '../dto/user-list.dto';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { UpdateFeedDto } from '../../feed/dto/update-feed.dto';
import { AdminUpdateFeedDto } from '../dto/admin-update-feed.dto';
import { UserStatsDto } from '../dto/user-stats.dto';

@ApiTags('관리자')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: '대시보드 통계',
    description: '총 사용자, 실종/발견 신고 건수, 전월 대비 증감율 제공',
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminService.getDashboard();
  }

  @Get('activity')
  @ApiOperation({
    summary: '유저 활동 통계',
    description: '날짜별 활성 사용자, 신규 가입, 실종/발견 신고 건수 제공',
  })
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
  @ApiOperation({
    summary: '최근 등록 동물',
    description: '가장 최근 등록된 동물 5개 ',
  })
  async getRecentAnimals(): Promise<RecentAnimalDto[]> {
    return this.adminService.getRecentAnimals();
  }

  @Get('users')
  @ApiOperation({ summary: '유저 리스트', description: '유저 정보 리스트 ' })
  async getUserList(): Promise<UserListDto[]> {
    return this.adminService.getUserList();
  }

  @Put(':id')
  @ApiOperation({
    summary: '유저 정보 수정',
    description: '유저의 정보를 수정합니다.',
  })
  async updateUserInfo(
    @Param('id') id: number,
    @Body(new ValidationPipe({ transform: true }))
    updateUserDto: AdminUpdateUserDto,
  ): Promise<ResponseDto<any>> {
    const updateUser = await this.adminService.updateUserInfo(
      id,
      updateUserDto,
    );
    return ResponseDto.ok(updateUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: '유저 삭제', description: '유저를 삭제합니다.' })
  async deleteUser(@Param('id') id: number): Promise<ResponseDto<any>> {
    await this.adminService.deleteUserById(id);
    return ResponseDto.ok();
  }

  @Get('all')
  @ApiOperation({summary:'모든 피드 조회', description:'모든 피드를 조회합니다'})
  async getAllFeeds(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<ResponseDto<any>> {
    const feeds = await this.adminService.getAllFeeds(page, limit);
    return ResponseDto.ok(feeds);
  }

  @Put('feeds/:id')
  @ApiOperation({
    summary: '피드 정보 수정',
    description: '피드의 정보를 수정합니다.',
  })
  async updateFeedInfo(
    @Param('id') id: number,
    @Body(new ValidationPipe({ transform: true }))
    updateFeedDto: AdminUpdateFeedDto,
  ): Promise<ResponseDto<any>> {
    const updateFeed = await this.adminService.updateFeedInfo(
      id, updateFeedDto,
    );
    return ResponseDto.ok(updateFeed);
  }

  @Delete('feeds/:id')
  @ApiOperation({ summary: '피드 삭제', description: '피드를 삭제합니다' })
  async deleteFeed(@Param('id') id: number): Promise<ResponseDto<any>> {

    await this.adminService.deleteFeedById(id);
    return ResponseDto.ok();
  }

  @Get('user-stats')
  @ApiOperation({
    summary: '회원 통계',
    description: '오늘/어제 신규가입, 로그인활동, 최근7일 신규가입, 전체회원수',
  })
  async getUserStats(): Promise<UserStatsDto> {
    return this.adminService.getUserStats();
  }
}