export class DashboardStatsDto {
  totalUsers: number;
  missingReports: number;
  foundReports: number;
  matchingSuccessRate: number;
  usersChange: number;
  missingToday: number;
  foundToday: number;
  matchingChange: number;

  constructor(partial?: Partial<DashboardStatsDto>) {
    if (partial) Object.assign(this, partial);
  }
}
