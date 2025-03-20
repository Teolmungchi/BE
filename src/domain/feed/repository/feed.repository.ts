import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Feed } from '../entity/feed.entity';

@Injectable()
export class FeedRepository extends Repository<Feed>{
  constructor(private dataSource: DataSource) {
    super(Feed, dataSource.createEntityManager())
  }
}

