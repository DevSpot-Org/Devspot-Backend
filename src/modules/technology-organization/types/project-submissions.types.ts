export interface ProjectSubmissionsAnalytics {
  overview_text: string;
  total_projects_submitted: number;
  total_project_challenge_pairs: number;
  most_used_technology: string;
  avg_projects_per_participant: number;
  challenge_with_most_submissions: string;
}

export interface ProjectSubmissionsAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface ProjectSubmissionsAnalyticsResponse {
  project_submissions: ProjectSubmissionsAnalytics;
}
