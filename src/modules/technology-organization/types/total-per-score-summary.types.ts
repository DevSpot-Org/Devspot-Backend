export interface TotalPerScoreSummary {
  challenge_id: number;
  total_project_submissions: number;
  judge_mean_score: number;
  judge_median_score: number;
  judge_mode_score: number;
  bot_mean_score: number;
  bot_median_score: number;
  bot_mode_score: number;
}

export interface TotalPerScoreSummaryAnalyticsResponse {
  total_per_score_summary: TotalPerScoreSummary[];
}
