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
      relations: ['author'],
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
        }),
    );
  }

  async getDashboard(): Promise<DashboardStatsDto> {
    // 날짜 계산
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // 전체 사용자 수
    const totalUsers = await this.userRepository.count();

    // 매칭 결과 기준 실종/발견 수
    const missingReports = await this.matchingResultRepository.count({ where: { status: MatchingStatus.NOT_FOUND } });
    const foundReports = await this.matchingResultRepository.count({ where: { status: MatchingStatus.FOUND } });

    // 매칭 성공률
    const totalMatches = missingReports + foundReports;
    const matchingSuccessRate = totalMatches === 0 ? 0 : (foundReports / totalMatches) * 100;

    // 전월 대비 사용자 증가율
    const thisMonthUsers = await this.userRepository.count({ where: { createdAt: MoreThanOrEqual(thisMonthStart) } });
    const lastMonthUsers = await this.userRepository.count({ where: { createdAt: Between(lastMonthStart, lastMonthEnd) } });
    const usersChange = lastMonthUsers === 0 ? 0 : ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

    // 오늘 실종/발견 신고 수
    const missingToday = await this.matchingResultRepository.count({
      where: {
        status: MatchingStatus.NOT_FOUND,
        createdAt: MoreThanOrEqual(todayStart),
      },
    });
    const foundToday = await this.matchingResultRepository.count({
      where: {
        status: MatchingStatus.FOUND,
        createdAt: MoreThanOrEqual(todayStart),
      },
    });

    // 전월 매칭 성공률
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
      relations: ['author'],
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
}
