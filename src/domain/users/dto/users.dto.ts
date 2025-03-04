import { User } from '../entity/user.entity';

export class UsersDto {
  readonly id: number;
  readonly name: string;

  static fromEntity(user: User) {
    return {
      id: user.id,
      name: user.name,
    };
  }
}
