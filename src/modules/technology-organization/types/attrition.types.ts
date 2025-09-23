export interface AttritionAnalytics {
  overview: {
    attrition_overview: string;
    attrition_percentage: number;
    number_of_signups: number;
    participants_who_created_project: number;
  };
}

export interface AttritionAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface AttritionAnalyticsResponse {
  data: AttritionAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
