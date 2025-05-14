export class DashboardStatsDto {
  totalUsers: number;
  missingReports: number;
  foundReports: number;
  matchingSuccessRate: number;
  constructor(partial?: Partial<DashboardStatsDto>) {
    if (partial) Object.assign(this, partial);
  }
}
