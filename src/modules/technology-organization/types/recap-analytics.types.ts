export interface HackathonRecapAnalytics {
  overview: {
    hackathon_start_date: string;
    hackathon_end_date: string;
    number_of_challenges: number;
    total_projects_submitted: number;
    total_project_challenge_pairs: number;
  };
}

export interface HackathonRecapAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface HackathonRecapAnalyticsResponse {
  data: HackathonRecapAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
