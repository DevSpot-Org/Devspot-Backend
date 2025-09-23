export interface TechnologyCount {
  technology: string;
  usage_count: number;
  usage_percentage: number;
}

export interface TechnologiesCountAnalytics {
  technologies_count: TechnologyCount[];
}

export interface TechnologiesCountAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface TechnologiesCountAnalyticsResponse {
  data: TechnologiesCountAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
