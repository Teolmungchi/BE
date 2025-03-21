import { DataSource, Repository } from 'typeorm';
import { Like } from '../entity/like.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikeRepository extends Repository<Like> {
  constructor(private dataSource: DataSource) {
    super(Like, dataSource.createEntityManager());
  }
}
