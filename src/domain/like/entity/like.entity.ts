import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Feed } from '../../feed/entity/feed.entity';
import { BaseTime } from '../../../global/utils/basetime.entity';

@Entity({ name: 'likes' })
@Unique(['user', 'feed'])
export class Like extends BaseTime{

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Feed, (feed) => feed.id, { onDelete: 'CASCADE' })
  feed: Feed;
}