export interface MostCommonSkillsAnalytics {
  overview: {
    most_common_skills_overview: string;
    total_participants: number;
    total_skills: number;
    skills_with_counts_and_percentages: Array<{
      skill_name: string;
      count: number;
      percentage: number;
    }>;
  };
}

export interface MostCommonSkillsAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface MostCommonSkillsAnalyticsResponse {
  data: MostCommonSkillsAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
