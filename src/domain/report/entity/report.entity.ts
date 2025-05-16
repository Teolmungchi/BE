import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entity/user.entity';
import { BaseTime } from '../../../global/utils/basetime.entity';

@Entity()
export class Report extends BaseTime {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  id: number;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  author: User;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;
}