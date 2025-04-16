import { User } from '../entity/user.entity';

export class UsersDto {
  readonly id: number;
  readonly login_id: string;
  readonly name: string;

  static fromEntity(user: User) {
    return {
      id: user.id,
      login_id: user.serialId,
      name: user.name,
    };
  }
}
