export class UserListDto {
  user_id: number;
  serial_id: string;
  name: string;
  is_login: boolean;
  created_at: Date;
  updated_at: Date;
  role: string;

  constructor(partial: Partial<UserListDto>) {
    Object.assign(this, partial);
  }
}
