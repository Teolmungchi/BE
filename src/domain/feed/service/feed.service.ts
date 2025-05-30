import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '../../../global/exception/filter/http-exception.filter';
import { FeedRepository } from '../repository/feed.repository';
import { CreateFeedDto } from '../dto/create-feed.dto';
import { UpdateFeedDto } from '../dto/update-feed.dto';
import { Feed } from '../entity/feed.entity';
import { CommonException } from '../../../global/exception/common-exception';
import { ErrorCode } from '../../../global/exception/error-code';
import { UserRepository } from '../../users/repository/user.repository';
import { FeedResponseDto } from '../dto/feed-response.dto';
import { FeedUrlResponseDto } from '../dto/feed-url-response.dto';
import { MinioService } from '../../s3/service/minio.service';
import { PresignedUrlDto } from '../../s3/dto/presigned-url.dto';

@Injectable()
@UseFilters(HttpExceptionFilter)
export class FeedService {
  constructor(
    private feedRepository: FeedRepository,
    private userRepository: UserRepository,
    private readonly minioService: MinioService,
  ) {}

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
      relations: ['author'],
    });

    return feeds;
  }

  async updateFeedById(
    userId: number,
    id: number,
    updateFeedDto: UpdateFeedDto,
  ): Promise<Feed> {
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
    if (feed.author.id !== userId) {
      throw new CommonException(ErrorCode.ACCESS_DENIED);
    }

    const updatedFields = Object.entries(updateFeedDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Partial<Feed>,
    );

    Object.assign(feed, updatedFields);

    return await this.feedRepository.save(feed);
  }

  async deleteFeedById(userId: number, id: number) {
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
    if (feed.author.id !== userId) {
      throw new CommonException(ErrorCode.ACCESS_DENIED);
    }
    await this.feedRepository.remove(feed);
  }

  async getAllFeeds(): Promise<FeedResponseDto[]> {
    const feeds = await this.feedRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    // DTO 변환 및 presigned URL 생성
    const feedResponseDtos = await Promise.all(
      feeds.map(async (feed) => {
        let filePresignedUrl: string = '';

        if (feed.fileName) {
          try {
            // minioService를 사용하여 presigned URL 가져오기
            // getPresignedUrlForDownload는 PresignedUrlDto를 반환
            const presignedUrlDto: PresignedUrlDto = await this.minioService.getPresignedUrlForDownload(feed.fileName);
            filePresignedUrl = presignedUrlDto.url; // DTO에서 url 필드 사용
          } catch (error) {
            // getPresignedUrlForDownload 내부에서 CommonException을 throw하므로
            // 여기서 추가적인 로깅을 하거나, 에러 발생 시 null로 처리할 수 있습니다.
            // 이미 minioService에서 로깅을 하고 있다면 중복 로깅은 피할 수 있습니다.
            Logger.error(`Feed ID ${feed.id}의 파일(${feed.fileName})에 대한 presigned URL 생성 실패:`, error.message);
            // filePresignedUrl은 null로 유지됩니다.
            // 만약 하나의 URL 생성 실패가 전체 요청 실패로 이어져야 한다면, 여기서 다시 throw 할 수 있습니다.
            // throw error;
          }
        }

        return {
          id: feed.id,
          title: feed.title,
          content: feed.content,
          presignedUrl: filePresignedUrl, // 생성된 presigned URL (실패 시 null)
          lostDate: feed.lostDate,
          lostPlace: feed.lostPlace,
          placeFeature: feed.placeFeature,
          dogType: feed.dogType,
          dogAge: feed.dogAge,
          dogGender: feed.dogGender,
          dogColor: feed.dogColor,
          dogFeature: feed.dogFeature,
          likesCount: feed.likesCount,
          createdAt: feed.createdAt,
          updatedAt: feed.updatedAt,
          author: {
            id: feed.author.id,
            name: feed.author.name,
          },
        };
      }),
    );

    return feedResponseDtos;
  }

  async getAllFeedUrls(): Promise<FeedUrlResponseDto[]> {
    const feeds = await this.feedRepository
      .createQueryBuilder('feed')
      .leftJoin('feed.author', 'author')
      .select([
        'feed.id',
        'feed.fileName',
        'author.id',
      ])
      .getMany();

    return Promise.all(
      feeds.map(async feed => {
        const presigned = await this.minioService.getPresignedUrlForDownload(feed.fileName);
        return {
          feed_id: feed.id,
          authorId: feed.author?.id,
          presigned_url: presigned.url,
        };
      }),
    );
  }



}