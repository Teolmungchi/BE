import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { Feed } from './feed.entity';

@Entity({ name: 'likes' })
@Unique(['user', 'feed'])
export class Like {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Feed, (feed) => feed.id, { onDelete: 'CASCADE' })
  feed: Feed;

  @CreateDateColumn()
  createdAt: Date;
}