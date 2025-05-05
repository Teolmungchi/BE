export class UserListDto {
  user_id: number;
  serial_id: string;
  name: string | null;
  is_login: number;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';

  constructor(raw: any) {
    this.user_id = raw.user_id ?? raw.user_user_id;
    this.serial_id = raw.serial_id ?? raw.user_serial_id;
    this.name = raw.name ?? raw.user_name;
    this.is_login = raw.is_login ?? raw.user_is_login;
    this.created_at = (raw.created_at ?? raw.user_created_at)?.toISOString?.() ?? raw.created_at ?? raw.user_created_at;
    this.updated_at = (raw.updated_at ?? raw.user_updated_at)?.toISOString?.() ?? raw.updated_at ?? raw.user_updated_at;
    this.role = raw.role ?? raw.user_role;
  }
}
