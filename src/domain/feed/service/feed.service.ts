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
    feed.title = createFeedDto.title;
    feed.content = createFeedDto.content;
    feed.imageUrl = createFeedDto.imageUrl ? createFeedDto.imageUrl : '';
    feed.lostDate = createFeedDto.lostDate;
    feed.lostPlace = createFeedDto.lostPlace;
    feed.placeFeature = createFeedDto.placeFeature;
    feed.dogType = createFeedDto.dogType;
    feed.dogAge = createFeedDto.dogAge;
    feed.dogGender = createFeedDto.dogGender;
    feed.dogColor = createFeedDto.dogColor;
    feed.dogFeature = createFeedDto.dogFeature;

    feed.author = { id: userId } as any;
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
    if (updateFeedDto.title !== undefined) {
      feed.title = updateFeedDto.title;
    }
    if (updateFeedDto.content !== undefined) {
      feed.content = updateFeedDto.content;
    }
    if(updateFeedDto.imageUrl !== undefined) {
      feed.imageUrl = updateFeedDto.imageUrl;
    }
    if(updateFeedDto.lostDate !== undefined) {
      feed.lostDate = updateFeedDto.lostDate;
    }
    if(updateFeedDto.lostPlace !== undefined) {
      feed.lostPlace = updateFeedDto.lostPlace;
    }
    if(updateFeedDto.placeFeature !== undefined) {
      feed.placeFeature = updateFeedDto.placeFeature;
    }
    if(updateFeedDto.dogType !== undefined) {
      feed.dogType = updateFeedDto.dogType;
    }
    if(updateFeedDto.dogAge !== undefined) {
      feed.dogAge = updateFeedDto.dogAge;
    }
    if(updateFeedDto.dogGender !== undefined) {
      feed.dogGender = updateFeedDto.dogGender;
    }
    if(updateFeedDto.dogColor !== undefined) {
      feed.dogColor = updateFeedDto.dogColor;
    }
    if(updateFeedDto.dogFeature !== undefined) {
      feed.dogFeature = updateFeedDto.dogFeature;
    }
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