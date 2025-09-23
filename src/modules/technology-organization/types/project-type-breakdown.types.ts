export interface ProjectTypeBreakdown {
  fresh_code: number;
  existing_code: number;
  null_type: number;
}

export interface ProjectTypeBreakdownAnalytics {
  type_breakdown: ProjectTypeBreakdown;
}

export interface ProjectTypeBreakdownAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface ProjectTypeBreakdownAnalyticsResponse {
  data: ProjectTypeBreakdownAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
