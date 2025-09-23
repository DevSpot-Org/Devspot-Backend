export interface WinningProjectPerPrize {
  challenge_name: string;
  prize_title: string;
  company_partner_logo: string | null;
  prize_usd: number | null;
  rank: number | null;
  prize_custom: string | null;
  project_name: string | null;
  project_picture: string | null;
  project_score: number | null;
}

export interface WinningProjectPerPrizeAnalytics {
  winning_projects_per_prize: WinningProjectPerPrize[];
}

export interface WinningProjectPerPrizeAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
  challengeIds: number[];
}

export interface WinningProjectPerPrizeAnalyticsResponse {
  data: WinningProjectPerPrizeAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
