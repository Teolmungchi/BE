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

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchingResult)
    private readonly matchingResultRepository: Repository<MatchingResult>,
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
          const status = percent >= 90 ? MatchingStatus.FOUND : MatchingStatus.NOT_FOUND;

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
              percent >= 90
                ? `잃어버린 동물을 제보해주셨어요! 유사도 ${Math.round(percent)}%!`
                : undefined,
          };
        } catch (e) {
          return null;
        }
      })
    );

    // 90% 이상만 응답
    return allResults.filter(
      (item): item is {
        feed_id: number;
        authorId: number;
        reporterId: number;
        similarity: number;
        saved: boolean;
        message: string;
      } => !!item && item.saved && typeof item.similarity === 'number' && item.similarity >= 90
    );
  }


  async getSimilarities(
    userId: number,
  ): Promise<{ finderId: number; message: string; presigned_url: string }[]> {
    // 1. 보호자가 작성한 feed 목록 조회
    const feeds = await this.feedRepository.find({
      where: { author: { id: userId } },
      select: ['id'],
    });
    const feedIds = feeds.map((feed) => feed.id);

    if (feedIds.length === 0) {
      return [];
    }

    // 2. 해당 feedId에 대한 similarity 90 이상인 MatchingResult 조회 (feed, user, feed.fileName 필요)
    const matchingResults = await this.matchingResultRepository.find({
      where: {
        feed: { id: In(feedIds) },
        similarity: MoreThanOrEqual(90),
      },
      relations: ['user', 'feed'],
    });

    // 3. presigned_url 발급 및 결과 생성
    return Promise.all(
      matchingResults.map(async (result) => {
        // presigned_url 발급 (feed.fileName 사용)
        const presigned = await this.minioService.getPresignedUrlForDownload(result.feed.fileName);
        return {
          finderId: result.user.id,
          message: `유사도${result.similarity}인 제보가 들어왔어요!`,
          presigned_url: presigned.url,
        };
      }),
    );
  }

}
