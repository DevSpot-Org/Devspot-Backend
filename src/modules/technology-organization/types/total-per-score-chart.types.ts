export interface ScoreRange {
    score_range: string; // e.g., "0-1", "1-2", "2-3", etc.
    judge_count: number;
    bot_count: number;
  }
  
  export interface TotalPerScoreChart {
    challenge_id: number;
    score_distribution: ScoreRange[];
  }
  
  export interface TotalPerScoreChartAnalyticsResponse {
    total_per_score_chart: TotalPerScoreChart[];
  }