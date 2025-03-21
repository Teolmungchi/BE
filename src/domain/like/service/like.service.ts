import { Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { LikeRepository } from '../repository/like.repository';
import { ResponseDto } from '../../../global/exception/dto/response.dto';
import { FeedRepository } from '../../feed/repository/feed.repository';
import { UserRepository } from '../../users/repository/user.repository';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';
import { Like } from '../entity/like.entity';

@Injectable()
@UseFilters(HttpExceptionFilter)
export class LikeService {
  constructor(
    private readonly likeRepository: LikeRepository,
    private readonly feedRepository: FeedRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async likeFeed(userId: number, feedId: number): Promise<Like> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = await this.feedRepository.findOne({ where: { id: feedId } });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }

    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, feed: { id: feedId } },
    });
    if (existingLike) {
      throw new CommonException(ErrorCode.ALREADY_LIKED);
    }

    const like = new Like();
    like.user = { id: userId } as any;
    like.feed = feed;

    const savedLike = await this.likeRepository.save(like);

    feed.likesCount += 1;
    await this.feedRepository.save(feed);

    return savedLike;
  }

  async unlikeFeed(userId: number, feedId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = await this.feedRepository.findOne({ where: { id: feedId } });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }

    const like = await this.likeRepository.findOne({
      where: { user: {id: userId}, feed: {id:feedId}}
    })
    if (!like) {
      throw new CommonException(ErrorCode.NOT_FOUND_LIKE);
    }

    await this.likeRepository.remove(like);

    feed.likesCount = feed.likesCount > 0 ? feed.likesCount - 1 : 0;
    await this.feedRepository.save(feed);
  }
}