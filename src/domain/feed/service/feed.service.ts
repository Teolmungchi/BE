import { Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { FeedRepository } from '../repository/feed.repository';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';
import { Feed } from '../entity/feed.entity';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';
import { UserRepository } from '../../users/repository/user.repository';

@Injectable()
@UseFilters(HttpExceptionFilter)
export class FeedService {
  constructor(private feedRepository: FeedRepository,
              private userRepository: UserRepository,) {}

  async createFeed(
    userId: number,
    createFeedDto: CreateFeedDto,
  ): Promise<Feed> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = new Feed();
    Object.assign(feed, {
      ...createFeedDto,
      fileName: createFeedDto.fileName || '',
      author: { id: userId } as any,
    });
    return await this.feedRepository.save(feed);
  }

  async getFeedById(userId: number, id: number): Promise<Feed> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = await this.feedRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }
    return feed;
  }

  async getFeeds(userId: number): Promise<Feed[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }
    const feeds = await this.feedRepository.find({
      where: { author: { id: userId } },
      relations: ['author']
    });

    return feeds;
  }

  async updateFeedById(
    userId: number,
    id: number,
    updateFeedDto: UpdateFeedDto,
  ) : Promise<Feed> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = await this.feedRepository.findOne({
      where: {id},
      relations: ['author'],
    })
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }
    if(feed.author.id !== userId) {
      throw new CommonException(ErrorCode.ACCESS_DENIED);
    }

    const updatedFields = Object.entries(updateFeedDto).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<Feed>)

    Object.assign(feed, updatedFields);

    return await this.feedRepository.save(feed);
  }

  async deleteFeedById(userId: number, id: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new CommonException(ErrorCode.NOT_FOUND_USER);
    }

    const feed = await this.feedRepository.findOne({ where: { id }, relations: ['author'] });
    if (!feed) {
      throw new CommonException(ErrorCode.NOT_FOUND_FEED);
    }
    if (feed.author.id !== userId) {
      throw new CommonException(ErrorCode.ACCESS_DENIED);
    }
    await this.feedRepository.remove(feed);
  }
}