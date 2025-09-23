export interface JudgingAndWinnersAnalytics {
  overview_text: string;
  judged_project_challenge_pairs: number;
  number_of_judges: number;
  average_score_stats: {
    mean: number;
    median: number;
    mode: number;
  };
  judgebot_vs_judge_score_difference: number;
}

export interface JudgingAndWinnersAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
  challengeIds: number[];
}

export interface JudgingAndWinnersAnalyticsResponse {
  judging_and_winners: JudgingAndWinnersAnalytics;
}
