export interface EngagementPartner {
  name: string;
  logo: string;
}

export interface EngagementPartnersAnalytics {
  overview: {
    sponsors: EngagementPartner[];
  };
}

export interface EngagementPartnersAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface EngagementPartnersAnalyticsResponse {
  data: EngagementPartnersAnalytics;
  message: string;
  isError: boolean;
  status: number;
}

