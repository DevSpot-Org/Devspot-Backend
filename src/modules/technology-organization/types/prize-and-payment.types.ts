export interface PrizeAndPaymentAnalytics {
  overview_text: string;
  total_teams_receiving_prize: number;
  total_individuals_receiving_prize: number;
}

export interface PrizeAndPaymentAnalyticsRequest {
  technologyOwnerId: number;
  hackathonId: number;
  challengeIds: number[];
}

export interface PrizeAndPaymentAnalyticsResponse {
  prize_and_payment: PrizeAndPaymentAnalytics;
}
