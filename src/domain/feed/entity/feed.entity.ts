import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { BaseTime } from '../../../global/utils/basetime.entity';
import { MatchingResult } from '../../match/entity/matching-result.entity';

@Entity()
export class Feed extends BaseTime {
  @PrimaryGeneratedColumn({ name: 'feed_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  author: User;

  @Column({
    name: 'title',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  title: string;

  @Column({
    name: 'content',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
  })
  content: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'lost_date', type: 'date', nullable: true })
  lostDate: Date;

  @Column({
    name: 'lost_place',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  lostPlace: string;

  @Column({
    name: 'place_feature',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  placeFeature: string;

  /**
   * 강아지 특징
   */
  @Column({
    name: 'dog_type',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  dogType: string;

  @Column({ name: 'dog_age', type: 'int', nullable: true })
  dogAge: number;

  @Column({
    name: 'dog_gender',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  dogGender: string;

  @Column({
    name: 'dog_color',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  dogColor: string;

  @Column({
    name: 'dog_feature',
    type: 'text',
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci',
    nullable: true,
  })
  dogFeature: string;

  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount: number;

  @OneToMany(() => MatchingResult, (mr) => mr.feed)
  matchingResults: MatchingResult[];
}