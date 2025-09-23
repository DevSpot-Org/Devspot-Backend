export interface SignUpsByLocationAnalytics {
  overview: {
    sign_ups_by_location_overview: string;
    total_countries: number;
    total_signups: number;
    sign_ups_by_country: Array<{
      country_name: string;
      signup_count: number;
    }>;
  };
}

export interface SignUpsByLocationAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface SignUpsByLocationAnalyticsResponse {
  data: SignUpsByLocationAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
