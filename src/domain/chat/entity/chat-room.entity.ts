import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { BaseTime } from '../../../global/utils/basetime.entity';

@Entity()
export class ChatRoom extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user1Id: number;

  @Column()
  user2Id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user1: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user2: User;

  @Column({ default: 0 })
  user1UnreadCount: number;

  @Column({ default: 0 })
  user2UnreadCount: number;

  @Column({ nullable: true , charset: 'utf8mb4'})
  lastMessage: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date;
}
