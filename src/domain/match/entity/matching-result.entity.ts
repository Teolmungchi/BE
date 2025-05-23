import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Feed } from '../../feed/entity/feed.entity';
import { MatchingStatus } from './matching-status.enum';
import { BaseTime } from '../../../global/utils/basetime.entity';
import { User } from '../../users/entity/user.entity';

@Entity()
export class MatchingResult extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Feed, (feed) => feed.matchingResults, {
    onDelete: 'CASCADE',
  })
  feed: Feed;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'enum', enum: MatchingStatus })
  status: MatchingStatus;

  @Column({ type: 'float' })
  similarity: number;
}