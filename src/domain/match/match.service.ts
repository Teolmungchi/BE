import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchingResult } from './entity/matching-result.entity';
import { Feed } from '../feed/entity/feed.entity';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { MatchingStatus } from './entity/matching-status.enum';
import { ErrorCode } from '../../global/exception/error-code';
import { CommonException } from '../../global/exception/common-exception';
import { FeedRepository } from '../feed/repository/feed.repository';
import { UserRepository } from '../users/repository/user.repository';
import { MinioService } from '../s3/service/minio.service';
import { Reports } from './entity/reports.entity';
import { User } from '../users/entity/user.entity';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchingResult)
    private readonly matchingResultRepository: Repository<MatchingResult>,
    @InjectRepository(Reports)
    private readonly reportRepository: Repository<Reports>,
    private feedRepository: FeedRepository,
    private userRepository: UserRepository,
    private readonly minioService: MinioService,
  ) {}

  async createMatchingResultsBulk(
    authorId: number, // 발견자 id
    results: { feed_id: number; similarity_score: number }[]
  ): Promise<{
    feed_id: number;
    authorId: number; // 발견자 id
    reporterId: number; // 신고자 id (feed.author.id)
    similarity: number;
    saved: boolean;
    message?: string;
  }[]> {
    if (!Array.isArray(results)) {
      throw new BadRequestException('results 필드는 배열이어야 합니다.');
    }
    if (results.length === 0) {
      throw new BadRequestException('results 배열이 비어있습니다.');
    }

    const finder = await this.userRepository.findOne({ where: { id: authorId } });
    if (!finder) throw new CommonException(ErrorCode.NOT_FOUND_USER);

    const allResults = await Promise.all(
      results.map(async (item) => {
        try {
          const percent = item.similarity_score > 1 ? item.similarity_score : item.similarity_score * 100;
          const status = percent >= 85 ? MatchingStatus.FOUND : MatchingStatus.NOT_FOUND;

          const feed = await this.feedRepository.findOne({ where: { id: item.feed_id }, relations: ['author'] });
          if (!feed) throw new CommonException(ErrorCode.NOT_FOUND_FEED);

          const reporter = feed.author;

          const result = this.matchingResultRepository.create({
            feed,
            user: finder, // 발견자
            similarity: percent,
            status,
          });
          await this.matchingResultRepository.save(result);

          return {
            feed_id: item.feed_id,
            authorId: authorId,         // 발견자 id
            reporterId: reporter.id,    // 신고자 id
            similarity: percent,
            saved: true,
            message:
              percent >= 85
                ? `잃어버린 동물을 제보해주셨어요! 유사도 ${Math.round(percent)}%!`
                : undefined,
          };
        } catch (e) {
          return null;
        }
      })
    );

    // 85% 이상만 응답
    return allResults.filter(
      (item): item is {
        feed_id: number;
        authorId: number;
        reporterId: number;
        similarity: number;
        saved: boolean;
        message: string;
      } => !!item && item.saved && typeof item.similarity === 'number' && item.similarity >= 85
    );
  }


  async getSimilarities(
    userId: number,
  ): Promise<{
    finderId: number;
    message: string;
    presigned_url: string;
    finder_presigned_url: string | null; // 타입 변경
  }[]> {
    const feeds = await this.feedRepository.find({
      where: { author: { id: userId } },
      select: ['id'],
    });
    const feedIds = feeds.map((feed) => feed.id);

    if (feedIds.length === 0) {
      return [];
    }

    const matchingResults = await this.matchingResultRepository.find({
      where: {
        feed: { id: In(feedIds) },
        similarity: MoreThanOrEqual(85),
      },
      relations: ['user', 'feed'],
    });

    if (matchingResults.length === 0) {
      return [];
    }

    const finderIds = [
      ...new Set(matchingResults.map((result) => result.user.id)),
    ];

    const finderReports = await this.reportRepository.find({
      where: { author: { id: In(finderIds) } },
      relations: ['author'],
    });



    const finderReportMap = new Map<number, typeof finderReports[0]>();
    finderReports.forEach(report => {
      if (!finderReportMap.has(report.author.id)) { // Report.author.id 라고 가정
        finderReportMap.set(report.author.id, report);
      }
    });


    return Promise.all(
      matchingResults.map(async (result) => {
        const presignedFeedUrl = await this.minioService.getPresignedUrlForDownload(
          result.feed.fileName,
        );

        let finderReportPresignedUrl: string | null = null;
        const finderReport = finderReportMap.get(result.user.id);

        if (finderReport && finderReport.fileName) {
          const urlResult = await this.minioService.getPresignedUrlForDownload(
            finderReport.fileName,
          );
          finderReportPresignedUrl = urlResult.url;
        }

        return {
          finderId: result.user.id,
          message: `유사도 ${result.similarity}%인 제보가 들어왔어요!`,
          presigned_url: presignedFeedUrl.url,
          finder_presigned_url: finderReportPresignedUrl,
        };
      }),
    );
  }


  async saveReport(userId: number, body: { fileName: string }): Promise<Reports> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const report = new Reports();
    report.fileName = body.fileName;
    report.author = { id: userId } as User;
    return await this.reportRepository.save(report);
  }
}
