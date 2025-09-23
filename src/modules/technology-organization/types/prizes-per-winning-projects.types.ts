export interface PrizePerWinningProject {
  project_name: string;
  prizes_won: number;
}

export interface PrizesPerWinningProjectsAnalytics {
  prizes_per_winning_projects: PrizePerWinningProject[];
}

export interface PrizesPerWinningProjectsAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface PrizesPerWinningProjectsAnalyticsResponse {
  data: PrizesPerWinningProjectsAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
