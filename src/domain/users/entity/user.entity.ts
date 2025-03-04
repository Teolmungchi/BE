import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'serial_id', unique: true})
  serialId: string;

  @Column({ name: 'password' })
  password: string;

  @Column({ name: 'is_login', type: 'boolean', default: false })
  isLogin: boolean;

  @Column({ name: 'refresh_token', type: 'varchar', length: 255, nullable: true })
  refreshToken: string | null;

  @Column({ name: 'name', nullable: true, type: 'varchar', length: 255, charset: 'utf8mb4' })
  name: string;

  // @Column()
  // role: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
