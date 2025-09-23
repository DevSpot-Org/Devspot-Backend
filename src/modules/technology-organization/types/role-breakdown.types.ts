export interface RoleBreakdown {
  role: string;
  count: number;
  percentage: number;
}

export interface RoleBreakdownAnalytics {
  role_breakdown: RoleBreakdown[];
}

export interface RoleBreakdownAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface RoleBreakdownAnalyticsResponse {
  data: RoleBreakdownAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
