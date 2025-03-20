import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity()
export class Feed {
  @PrimaryGeneratedColumn({ name: 'feed_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  author: User;

  @Column({ name: 'title', type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  title: string;

  @Column({ name: 'content', type: 'text', charset: 'utf8mb4', collation: 'utf8mb4_unicode_ci' })
  content: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @CreateDateColumn()
  createdAt: Date;
}