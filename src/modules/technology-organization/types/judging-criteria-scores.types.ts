export interface JudgingCriteriaScore {
  challenge_id: number;
  challenge_name: string;
  avg_technical: number;
  avg_ux: number;
  avg_innovation: number;
  avg_business: number;
  avg_overall_score: number;
  total_project_submissions: number;
}

export interface JudgingCriteriaScoresAnalytics {
  judging_criteria_scores: JudgingCriteriaScore[];
}

export interface JudgingCriteriaScoresAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
  challengeIds: number[];
}

export interface JudgingCriteriaScoresAnalyticsResponse {
  data: JudgingCriteriaScoresAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
