export interface ParticipantEngagementAnalytics {
  overview: {
    participant_engagement_overview: string;
    total_registrations: number;
    new_to_devspot: number;
    top_3_geographies: Array<{
      location: string;
      count: number;
    }>;
    number_of_solo_hackers: number;
    number_of_teams: number;
    average_team_size: number;
  };
}

export interface ParticipantEngagementAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface ParticipantEngagementAnalyticsResponse {
  data: ParticipantEngagementAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
