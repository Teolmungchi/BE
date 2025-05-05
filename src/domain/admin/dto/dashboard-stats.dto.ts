export class DashboardStatsDto {
  constructor(partial: Partial<DashboardStatsDto>) {
    Object.assign(this, partial);
  }
  totalUsers: number;
  missingReports: number;
  foundReports: number;
  userGrowthRate: number;
  missingGrowthRate: number;
  foundGrowthRate: number;
}