import { Injectable } from '@nestjs/common';
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

  // matching.service.ts

  async createMatchingResultsBulk(
    results: { feed_id: number; authorId: number; similarity_score: number }[]
  ): Promise<{ feed_id: number; authorId: number; saved: boolean; message?: string }[]> {
    // 여러 결과를 병렬로 저장
    return Promise.all(
      results.map(async (item) => {
        try {
          // percent 계산
          const percent = item.similarity_score > 1 ? item.similarity_score : item.similarity_score * 100;
          const status = percent >= 80 ? MatchingStatus.FOUND : MatchingStatus.NOT_FOUND;

          // feed, user 조회
          const feed = await this.feedRepository.findOne({ where: { id: item.feed_id }, relations: ['author'] });
          if (!feed) throw new CommonException(ErrorCode.NOT_FOUND_FEED);

          const user = await this.userRepository.findOne({ where: { id: item.authorId } });
          if (!user) throw new CommonException(ErrorCode.NOT_FOUND_USER);

          // 저장
          const result = this.matchingResultRepository.create({
            feed,
            user,
            similarity: percent,
            status,
          });
          await this.matchingResultRepository.save(result);

          return {
            feed_id: item.feed_id,
            authorId: item.authorId,
            saved: true,
            message: percent >= 80 ? `잃어버린 동물을 제보해주셨어요! 유사도 ${Math.round(percent)}%!` : undefined,
          };
        } catch (e) {
          // 에러 발생 시 저장 실패 표시
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
