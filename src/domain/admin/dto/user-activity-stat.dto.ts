export class UserActivityStatDto {
  constructor(partial: Partial<UserActivityStatDto>) {
    Object.assign(this, partial);
  }
  date: string;
  activeUsers: number;
  newUsers: number;
  missingReports: number;
  foundReports: number;
}
