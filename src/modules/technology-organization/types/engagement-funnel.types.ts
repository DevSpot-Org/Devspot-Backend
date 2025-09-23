export interface EngagementFunnel {
  registered: number;
  created_project: number;
  submitted_project: number;
}

export interface EngagementFunnelAnalytics {
  funnel: EngagementFunnel;
}

export interface EngagementFunnelAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface EngagementFunnelAnalyticsResponse {
  data: EngagementFunnelAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
