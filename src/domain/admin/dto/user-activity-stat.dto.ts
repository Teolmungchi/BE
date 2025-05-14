export class UserActivityStatDto {
  date: string;
  activeUsers: number;
  newUsers: number;
  missingReports: number;
  foundReports: number;

  constructor(partial: Partial<UserActivityStatDto>) {
    Object.assign(this, partial);
  }
}
