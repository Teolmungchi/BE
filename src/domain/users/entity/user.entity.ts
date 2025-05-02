import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTime } from '../../../global/utils/basetime.entity';
import { Role } from './role.enum';

@Entity({ name: 'users' })
export class User extends BaseTime {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'serial_id', unique: true })
  serialId: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'is_login', type: 'boolean', default: false })
  isLogin: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({
    name: 'refresh_token',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshToken: string | null;

  @Column({
    name: 'name',
    nullable: true,
    type: 'varchar',
    length: 255,
    charset: 'utf8mb4',
  })
  name: string;
}
