export interface SubmissionPerChallenge {
  challenge_name: string;
  submitted_projects: number;
}

export interface SubmissionsPerChallengeAnalytics {
  submissions_per_challenge: SubmissionPerChallenge[];
}

export interface SubmissionsPerChallengeAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface SubmissionsPerChallengeAnalyticsResponse {
  data: SubmissionsPerChallengeAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
