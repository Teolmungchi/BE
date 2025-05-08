import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { Feed } from '../feed/entity/feed.entity';
import { UserActivityStatDto } from './dto/user-activity-stat.dto';
import { CommonException } from '../../global/exception/common-exception';
import { ErrorCode } from '../../global/exception/error-code';
import { RecentAnimalDto } from './dto/recent-animal.dto';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { UserListDto } from './dto/user-list.dto';



@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
  ) {}

  async getUserActivity(startDate: string, endDate: string): Promise<UserActivityStatDto[]> {
    const rawStats = await this.userRepository.query(`
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
    `, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate]);

    if (!rawStats || rawStats.length === 0) {
      throw new CommonException(ErrorCode.NOT_FOUND_DATA);
    }

    return rawStats.map(row => new UserActivityStatDto({
      date: row.date,
      activeUsers: Number(row.activeUsers),
      newUsers: Number(row.newUsers),
      missingReports: Number(row.missingReports),
      foundReports: Number(row.foundReports),
    }));
  }


  // 최근 등록 동물 5개
  async getRecentAnimals(): Promise<RecentAnimalDto[]> {
    const feeds = await this.feedRepository.find({
      order: { createdAt: 'DESC' }, // createdAt이 entity에 매핑되어 있어야 함
      take: 5,
      relations: ['author'],
    });
    if (!feeds || feeds.length === 0) {
      throw new CommonException(ErrorCode.NOT_FOUND_DATA);
    }
    return feeds.map(feed => new RecentAnimalDto({
      id: feed.id,
      type: feed.title.includes('실종') ? 'missing' : 'found',
      animalType: feed.dogType || 'unknown',
      breed: feed.dogFeature || 'unknown',
      location: feed.lostPlace || '',
      date: feed.lostDate ? new Date(feed.lostDate).toISOString().slice(0, 10) : '',
      image: feed.fileName,
      user: {
        name: feed.author?.name,
      },
    }));
  }


  async getDashboard(): Promise<DashboardStatsDto> {
    const totalUsers = await this.userRepository.count();

    const missingReports = await this.feedRepository.count({
      where: { title: Like('%실종%') },
    });
    const foundReports = await this.feedRepository.count({
      where: { title: Like('%발견%') },
    });

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const thisMonthUsers = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(thisMonthStart) },
    });
    const lastMonthUsers = await this.userRepository.count({
      where: { createdAt: Between(lastMonthStart, lastMonthEnd) },
    });
    const userGrowthRate = lastMonthUsers === 0 ? 0 : ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;

    const thisMonthMissing = await this.feedRepository.count({
      where: {
        title: Like('%실종%'),
        createdAt: MoreThanOrEqual(thisMonthStart),
      },
    });
    const lastMonthMissing = await this.feedRepository.count({
      where: {
        title: Like('%실종%'),
        createdAt: Between(lastMonthStart, lastMonthEnd),
      },
    });
    const missingGrowthRate = lastMonthMissing === 0 ? 0 : ((thisMonthMissing - lastMonthMissing) / lastMonthMissing) * 100;

    const thisMonthFound = await this.feedRepository.count({
      where: {
        title: Like('%발견%'),
        createdAt: MoreThanOrEqual(thisMonthStart),
      },
    });
    const lastMonthFound = await this.feedRepository.count({
      where: {
        title: Like('%발견%'),
        createdAt: Between(lastMonthStart, lastMonthEnd),
      },
    });
    const foundGrowthRate = lastMonthFound === 0 ? 0 : ((thisMonthFound - lastMonthFound) / lastMonthFound) * 100;

    return new DashboardStatsDto({
      totalUsers,
      missingReports,
      foundReports,
      userGrowthRate,
      missingGrowthRate,
      foundGrowthRate,
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

    return users.map(user => new UserListDto({
      user_id: user.id,
      serial_id: user.serialId,
      name: user.name,
      is_login: user.isLogin,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      role: user.role,
    }));
  }



  // getMatch(month: string) {
  //   return undefined;
  // }
}