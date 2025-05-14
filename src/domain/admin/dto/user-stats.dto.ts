export class UserStatsDto {
  todayNew: number;         // 오늘 신규 가입자
  yesterdayNew: number;     // 어제 신규 가입자
  loginActive: number;      // 현재 로그인(is_login=true) 사용자 수
  last7DaysNew: number;     // 최근 7일 신규 가입자 수
  totalUsers: number;       // 전체 회원 수

  constructor(partial?: Partial<UserStatsDto>) {
    Object.assign(this, partial);
  }
}
