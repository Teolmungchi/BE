import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchingResult } from './entity/matching-result.entity';
import { Feed } from '../feed/entity/feed.entity';
import { Repository } from 'typeorm';
import { MatchingStatus } from './entity/matching-status.enum';
import { ErrorCode } from '../../global/exception/error-code';
import { CommonException } from '../../global/exception/common-exception';
import { FeedRepository } from '../feed/repository/feed.repository';
import { UserRepository } from '../users/repository/user.repository';

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchingResult)
    private readonly matchingResultRepository: Repository<MatchingResult>,
    private feedRepository: FeedRepository,
    private userRepository: UserRepository,
  ) {}


  async createMatchingResultsBulk(
    results: { feed_id: number; authorId: number; similarity_score: number }[]
  ): Promise<{
    feed_id: number;
    authorId: number;
    reporterId?: number;
    similarity?: number;
    saved: boolean;
    message?: string;
  }[]> {
    if (!Array.isArray(results)) {
      throw new BadRequestException('results 필드는 배열이어야 합니다.');
    }
    if (results.length === 0) {
      throw new BadRequestException('results 배열이 비어있습니다.');
    }

    return Promise.all(
      results.map(async (item) => {
        try {
          // percent 계산
          const percent = item.similarity_score > 1 ? item.similarity_score : item.similarity_score * 100;
          const status = percent >= 80 ? MatchingStatus.FOUND : MatchingStatus.NOT_FOUND;

          // feed, user 조회
          const feed = await this.feedRepository.findOne({ where: { id: item.feed_id }, relations: ['author'] });
          if (!feed) throw new CommonException(ErrorCode.NOT_FOUND_FEED);

          const finder = await this.userRepository.findOne({ where: { id: item.authorId } });
          if (!finder) throw new CommonException(ErrorCode.NOT_FOUND_USER);

          // feed.author가 신고자(잃어버린 사람)
          const reporter = feed.author;

          const result = this.matchingResultRepository.create({
            feed,
            user: finder,
            similarity: percent,
            status,
          });
          await this.matchingResultRepository.save(result);

          // 결과 객체에 발견자, 신고자, 유사도, feed_id 포함
          return {
            feed_id: item.feed_id,
            authorId: finder.id, // 발견자
            reporterId: reporter.id, // 신고자
            similarity: percent,
            saved: true,
            message:
              percent >= 80
                ? `잃어버린 동물을 제보해주셨어요! 유사도 ${Math.round(percent)}%!`
                : undefined,
          };
        } catch (e) {
          return {
            feed_id: item.feed_id,
            authorId: item.authorId,
            saved: false,
            message: e.message,
          };
        }
      })
    );
  }


}
