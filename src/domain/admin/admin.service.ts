import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { Feed } from '../feed/entity/feed.entity';
import { MatchingResult } from '../match/entity/matching-result.entity';
import { MatchingStatus } from '../match/entity/matching-status.enum';
import { UserActivityStatDto } from './dto/user-activity-stat.dto';
import { CommonException } from '../../global/exception/common-exception';
import { ErrorCode } from '../../global/exception/error-code';
import { RecentAnimalDto } from './dto/recent-animal.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { UserListDto } from './dto/user-list.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { UsersDto } from '../users/dto/users.dto';
import { AdminUpdateFeedDto } from './dto/admin-update-feed.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    @InjectRepository(MatchingResult)
    private readonly matchingResultRepository: Repository<MatchingResult>,
  ) {}

  async getUserActivity(
    startDate: string,
    endDate: string,
  ): Promise<UserActivityStatDto[]> {
    const rawStats = await this.userRepository.query(
      `
      SELECT
        d.date,
        COALESCE(u.activeUsers, 0) AS activeUsers,
        COALESCE(u.newUsers, 0) AS newUsers,
        COALESCE(f.missingReports, 0) AS missingReports,
        COALESCE(f.foundReports, 0) AS foundReports
      FROM
        (
          SELECT DATE(created_at) AS date
      FROM users
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      UNION
      SELECT DATE(created_at) AS date
      FROM feed
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
        ) d
        LEFT JOIN (
      SELECT
        DATE(created_at) AS date,
        SUM(is_login = 1) AS activeUsers,
        COUNT(*) AS newUsers
      FROM users
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
        ) u ON d.date = u.date
        LEFT JOIN (
        SELECT
        DATE(created_at) AS date,
        SUM(title LIKE '%실종%') AS missingReports,
        SUM(title LIKE '%발견%') AS foundReports
        FROM feed
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ) f ON d.date = f.date
      ORDER BY d.date ASC
    `,
      [
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
        startDate,
        endDate,
      ],
    );

    if (!rawStats || rawStats.length === 0) {
      throw new CommonException(ErrorCode.NOT_FOUND_DATA);
    }

    return rawStats.map(
      (row) =>
        new UserActivityStatDto({
          date: row.date,
          activeUsers: Number(row.activeUsers),
          newUsers: Number(row.newUsers),
          missingReports: Number(row.missingReports),
          foundReports: Number(row.foundReports),
        }),
    );
  }

  // 최근 등록 동물 5개
  async getRecentAnimals(): Promise<RecentAnimalDto[]> {
    const feeds = await this.feedRepository.find({
      order: { id: 'DESC' },
      take: 5,
      relations: ['author', 'matchingResults'],
    });
    if (!feeds || feeds.length === 0) {
      throw new CommonException(ErrorCode.NOT_FOUND_DATA);
    }
    return feeds.map(
      (feed) =>
        new RecentAnimalDto({
          id: feed.id,
          type: feed.title.includes('실종') ? 'missing' : 'found',
          animalType: feed.dogType || 'unknown',
          breed: feed.dogFeature || 'unknown',
          location: feed.lostPlace || '',
          date: feed.lostDate
            ? new Date(feed.lostDate).toISOString().slice(0, 10)
            : '',
          image: feed.fileName,
          user: {
            name: feed.author?.name,
          },
          matchingStatuses: feed.matchingResults
            ? feed.matchingResults.map((mr) => mr.status)
            : [],
        }),
    );
  }

  async getDashboard(): Promise<DashboardStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 1. 총 사용자 수
    const totalUsers = await this.userRepository.count();

    // 2. 실종 신고: 전체 feed 글 수
    const missingReports = await this.feedRepository.count();

    // 3. 오늘 실종 신고: 오늘 생성된 feed 글 수
    const missingToday = await this.feedRepository.count({
      where: { createdAt: MoreThanOrEqual(todayStart) },
    });

    // 4. 발견 신고: FOUND 상태의 matching_result 총 count
    const foundReports = await this.matchingResultRepository.count({
      where: { status: MatchingStatus.FOUND },
    });

    // 5. 오늘 발견 신고: 오늘 FOUND된 matching_result count
    const foundToday = await this.matchingResultRepository.count({
      where: {
        status: MatchingStatus.FOUND,
        createdAt: MoreThanOrEqual(todayStart),
      },
    });

    // 6. 매칭 성공률: FOUND / (전체 matching_result)
    const totalMatches = await this.matchingResultRepository.count();
    const matchingSuccessRate = totalMatches === 0 ? 0 : (foundReports / totalMatches) * 100;

    // 7. 전월 대비 사용자 증가율
    const thisMonthUsers = await this.userRepository.count({ where: { createdAt: MoreThanOrEqual(thisMonthStart) } });
    const lastMonthUsers = await this.userRepository.count({ where: { createdAt: Between(lastMonthStart, lastMonthEnd) } });
    const usersChange = lastMonthUsers === 0 ? 0 : ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

    // 8. 전월 매칭 성공률 및 변화량
    const lastMonthMatches = await this.matchingResultRepository.count({
      where: {
        createdAt: Between(lastMonthStart, lastMonthEnd),
      },
    });
    const lastMonthFound = await this.matchingResultRepository.count({
      where: {
        status: MatchingStatus.FOUND,
        createdAt: Between(lastMonthStart, lastMonthEnd),
      },
    });
    const lastMonthMatchingRate = lastMonthMatches === 0 ? 0 : (lastMonthFound / lastMonthMatches) * 100;
    const matchingChange = matchingSuccessRate - lastMonthMatchingRate;

    return new DashboardStatsDto({
      totalUsers,
      missingReports,
      foundReports,
      matchingSuccessRate: Number(matchingSuccessRate.toFixed(1)),
      usersChange: Number(usersChange.toFixed(1)),
      missingToday,
      foundToday,
      matchingChange: Number(matchingChange.toFixed(1)),
    });
  }



  async getUserList(): Promise<UserListDto[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.serialId',
        'user.name',
        'user.isLogin',
        'user.createdAt',
        'user.updatedAt',
        'user.role',
      ])
      .getMany();

    return users.map(
      (user) =>
        new UserListDto({
          user_id: user.id,
          serial_id: user.serialId,
          name: user.name,
          is_login: user.isLogin,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
          role: user.role,
        }),
    );
  }

  async deleteUserById(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }
    await this.userRepository.delete({ id: userId });
  }

  async updateUserInfo(
    userId: number,
    updateUserDto: AdminUpdateUserDto,
  ): Promise<UsersDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }
    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.serial_id !== undefined)
      user.serialId = updateUserDto.serial_id;
    if (updateUserDto.is_login !== undefined)
      user.isLogin = updateUserDto.is_login;
    if (updateUserDto.role !== undefined) user.role = updateUserDto.role;

    const updatedUser = await this.userRepository.save(user);
    return UsersDto.fromEntity(updatedUser);
  }

  async getAllFeeds(
    page: number,
    limit: number,
  ): Promise<{ feeds: Feed[]; total: number }> {
    const [feeds, total] = await this.feedRepository.findAndCount({
      relations: ['author', 'matchingResults'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { feeds, total };
  }

  async deleteFeedById(feedId: number): Promise<void> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }
    await this.feedRepository.delete({ id: feedId });
  }

  async updateFeedInfo(feedId: number, updateFeedDto: AdminUpdateFeedDto): Promise<Feed> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }

    for (const [key, value] of Object.entries(updateFeedDto)) {
      if (value !== undefined) {
        feed[key] = value;
      }
    }

    const updatedFeed = await this.feedRepository.save(feed);
    return updatedFeed;
  }

  async getUserStats(): Promise<UserStatsDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart.getTime() - 1);
    const last7DaysStart = new Date(todayStart);
    last7DaysStart.setDate(todayStart.getDate() - 6);

    // 오늘 신규 가입자
    const todayNew = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(todayStart) },
    });

    // 어제 신규 가입자
    const yesterdayNew = await this.userRepository.count({
      where: {
        createdAt: Between(yesterdayStart, yesterdayEnd),
      },
    });

    // 현재 로그인 상태인 사용자 수
    const loginActive = await this.userRepository.count({
      where: { isLogin: true },
    });

    // 최근 7일 신규 가입자
    const last7DaysNew = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(last7DaysStart) },
    });

    // 전체 회원 수
    const totalUsers = await this.userRepository.count();

    return new UserStatsDto({
      todayNew,
      yesterdayNew,
      loginActive,
      last7DaysNew,
      totalUsers,
    });
  }
}
