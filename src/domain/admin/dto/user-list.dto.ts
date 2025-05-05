export class UserListDto {
  user_id: number;
  serial_id: string;
  name: string | null;
  is_login: number;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';

  constructor(partial: Partial<UserListDto>) {
    Object.assign(this, partial);
  }
}
