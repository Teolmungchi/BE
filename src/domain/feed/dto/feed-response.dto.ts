import { FeedAuthorDto } from './feed-author.dto';

export class FeedResponseDto {
  id: number;
  title: string;
  content: string;
  fileName: string;
  lostDate: Date;
  lostPlace: string;
  placeFeature: string;
  dogType: string;
  dogAge: number;
  dogGender: string;
  dogColor: string;
  dogFeature: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  author: FeedAuthorDto;
}