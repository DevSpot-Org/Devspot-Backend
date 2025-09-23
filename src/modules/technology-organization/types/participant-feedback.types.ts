export interface ParticipantFeedbackAnalytics {
  overview: {
    participant_feedback_overview: string;
    overall_hackathon_experience: number;
    likeliness_to_recommend_hackathon: number;
    overall_devspot_experience: number;
    likeliness_to_recommend_devspot: number;
  };
}

export interface ParticipantFeedbackAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
}

export interface ParticipantFeedbackAnalyticsResponse {
  data: ParticipantFeedbackAnalytics;
  message: string;
  isError: boolean;
  status: number;
}
