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

  async createMatchingResult(
    feedId: number,
    similarity: number,
    userId: number
  ): Promise<{ message?: string; userId?: number }> {
    const percent = similarity > 1 ? similarity : similarity * 100;
    const status = percent >= 80 ? MatchingStatus.FOUND : MatchingStatus.NOT_FOUND;

    const feed = await this.feedRepository.findOne({ where: { id: feedId }, relations: ['author'] });
    if (!feed) throw new CommonException(ErrorCode.NOT_FOUND_FEED);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const result = this.matchingResultRepository.create({
      feed,
      user,
      similarity: percent,
      status,
    });
    await this.matchingResultRepository.save(result);

    if (percent >= 80) {
      return {
        message: `잃어버린 동물을 제보해주셨어요! 유사도 ${Math.round(percent)}%!`,
        userId: user.id,
      };
    }
    return {};
  }


}
