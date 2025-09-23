export interface TechnologiesUsedAnalytics {
  technologies_used: string[];
}

export interface TechnologiesUsedAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface TechnologiesUsedAnalyticsResponse {
  data: TechnologiesUsedAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
