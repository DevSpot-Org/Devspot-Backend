import {
  HackathonChallengeBounties,
  HackathonChallenges,
} from "@/types/entities";

export interface DiscoverHackathonsResponse {
  hackathons: any[];
}

export interface HackathonFeedbackParams {
  hackathon_id: number;
}

export interface HackathonFeedbackRequest {
  feedback: string;
  rating?: number;
}

export interface HackathonFeedbackResponse {
  id: number;
  feedback: string;
  rating?: number;
  created_at: string;
}

export interface ApplyAdditionalQuestionsParams {
  hackathon_id: number;
}

export interface ApplyAdditionalQuestionsResponse {
  questions: any[];
}

export interface AnswerQuestionnaireParams {
  hackathon_id: number;
}

export interface AnswerQuestionnaireRequest {
  answers: Array<{
    question_id: number;
    answer: string;
  }>;
}

export interface AnswerQuestionnaireResponse {
  id: number;
  answers: any[];
}

export interface ParticipantTeamUpParams {
  hackathon_id: number;
  participant_id: string;
}

export interface ParticipantTeamUpRequest {
  action: "invite" | "accept" | "decline";
  message?: string;
}

export interface ParticipantTeamUpResponse {
  id: number;
  status: string;
}

export interface HackathonParticipantsParams {
  hackathon_id: number;
}

export interface HackathonParticipantsRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface HackathonParticipantsResponse {
  participants: any[];
  total: number;
  page: number;
  limit: number;
}

export interface HackathonChallengesParams {
  hackathon_id: number;
}

export interface HackathonChallengesResponse {
  challenges: any[];
}

export interface SearchHackathonChallengesParams {
  hackathon_id: number;
}

export interface SearchHackathonChallengesRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchHackathonChallengesResponse {
  challenges: any[];
  total: number;
}

export interface HackathonFaqsParams {
  hackathon_id: number;
}

export interface HackathonFaqsResponse {
  faqs: any[];
}

export interface HackathonFaqParams {
  hackathon_id: number;
  faq_id: number;
}

export interface HackathonFaqRequest {
  question: string;
  answer: string;
}

export interface HackathonFaqResponse {
  id: number;
  question: string;
  answer: string;
}

export interface HackathonCommunicationLinksParams {
  hackathon_id: number;
}

export interface HackathonCommunicationLinksResponse {
  links: any[];
}

export interface HackathonAnnouncementsParams {
  hackathon_id: number;
}

export interface HackathonAnnouncementsResponse {
  announcements: any[];
}

export interface HackathonAvailableTeammatesParams {
  hackathon_id: number;
}

export interface HackathonAvailableTeammatesResponse {
  teammates: any[];
}

export interface HackathonLookingForTeamParams {
  hackathon_id: number;
}

export interface HackathonLookingForTeamRequest {
  looking_for_team: boolean;
}

export interface HackathonLookingForTeamResponse {
  id: string;
  looking_for_team: boolean;
}

export interface HackathonScheduleParams {
  hackathon_id: number;
}

export interface HackathonScheduleResponse {
  sessions: any[];
}

export interface HackathonSessionRsvpParams {
  hackathon_id: number;
  session_id: number;
}

export interface HackathonSessionRsvpRequest {
  attending: boolean;
}

export interface HackathonSessionRsvpResponse {
  id: number;
  attending: boolean;
}

export interface HackathonUpcomingSessionParams {
  hackathon_id: number;
}

export interface HackathonUpcomingSessionResponse {
  session: any;
}

export interface HackathonProjectsParams {
  hackathon_id: number;
}

export interface HackathonProjectsRequest {
  page?: number;
  limit?: number;
}

export interface HackathonProjectsResponse {
  projects: any[];
  total: number;
}

export interface SearchHackathonProjectsParams {
  hackathon_id: number;
}

export interface SearchHackathonProjectsRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchHackathonProjectsResponse {
  projects: any[];
  total: number;
}

export interface HackathonPrizesParams {
  hackathon_id: number;
}

export interface HackathonPrizesResponse {
  prizes: any[];
}

export interface HackathonResourcesParams {
  hackathon_id: number;
}

export interface HackathonResourcesResponse {
  resources: any[];
}

export interface HackathonResourceParams {
  hackathon_id: number;
  resource_id: number;
}

export interface HackathonResourceResponse {
  id: number;
  title: string;
  description: string;
  url: string;
}

export interface HackathonOverviewParams {
  hackathon_id: number;
}

export interface HackathonOverviewResponse {
  hackathon: any;
}

export interface HackathonJoinParams {
  hackathon_id: number;
}

export interface HackathonJoinRequest {
  email?: string;
}

export interface HackathonJoinResponse {
  id: string;
  status: string;
}

export interface HackathonJoinStakeParams {
  hackathon_id: number;
}

export interface HackathonJoinStakeRequest {
  amount: number;
}

export interface HackathonJoinStakeResponse {
  transaction_id: string;
  status: string;
}

export interface HackathonJoinStakeStatusParams {
  hackathon_id: number;
}

export interface HackathonJoinStakeStatusResponse {
  status: string;
  amount?: number;
}

export interface HackathonJudgesSearchParams {
  hackathon_id: number;
}

export interface HackathonJudgesSearchRequest {
  query: string;
}

export interface HackathonJudgesSearchResponse {
  judges: any[];
}

export interface HackathonLeaderboardParams {
  hackathon_id: number;
}

export interface HackathonLeaderboardResponse {
  leaderboard: any[];
}

export interface HackathonLeaveParams {
  hackathon_id: number;
}

export interface HackathonLeaveResponse {
  message: string;
}

export interface HackathonSponsorsParams {
  hackathon_id: number;
}

export interface HackathonSponsorsResponse {
  sponsors: any[];
}

export interface HackathonStakeParams {
  hackathon_id: number;
}

export interface HackathonStakeRequest {
  amount: number;
}

export interface HackathonStakeResponse {
  transaction_id: string;
  status: string;
}

export interface HackathonToggleJudgeParams {
  hackathon_id: number;
}

export interface HackathonToggleJudgeRequest {
  is_judge: boolean;
}

export interface HackathonToggleJudgeResponse {
  id: string;
  is_judge: boolean;
}

export interface HackathonToggleMultiProjectsParams {
  hackathon_id: number;
}

export interface HackathonToggleMultiProjectsRequest {
  allow_multiple_projects: boolean;
}

export interface HackathonToggleMultiProjectsResponse {
  id: number;
  allow_multiple_projects: boolean;
}

export interface HackathonVipsParams {
  hackathon_id: number;
}

export interface HackathonVipsResponse {
  vips: any[];
}

export interface HackathonHandleInvitationParams {
  hackathon_id: number;
}

export interface HackathonHandleInvitationRequest {
  action: "accept" | "decline";
  invitation_id: number;
}

export interface HackathonHandleInvitationResponse {
  message: string;
}

export interface HackathonParams {
  hackathon_id: number;
}

export interface HackathonResponse {
  hackathon: any;
}

export interface SearchHackathonsRequest {
  query: string;
  page?: number;
  limit?: number;
}

export interface SearchHackathonsResponse {
  hackathons: any[];
  total: number;
}

export interface HackathonsRequest {
  page?: number;
  limit?: number;
  status?: string;
}

export interface HackathonsResponse {
  hackathons: any[];
  total: number;
}

export interface UserHackathonsParams {
  user_id: string;
}

export interface UserHackathonsResponse {
  hackathons: any[];
}

export interface Sponsor {
  logo: string | File;
  name: string;
  website: string;
  tier: string;
}

export interface EditHackathonChallengePrize
  extends Omit<Partial<HackathonChallengeBounties>, "company_partner_logo"> {
  company_partner_logo: string | File;
}

export interface Challenge
  extends Omit<Partial<HackathonChallenges>, "sponsors" | "prizes"> {
  sponsors: Sponsor[];
  prizes: EditHackathonChallengePrize[];
}

export interface Judges {
  judgingCriteria: string[];
  judgeIds: string[];
  customJudgeEmail: string;
}

export interface ChallengeFormData {
  challenge: Challenge;
  judges: Judges;
}

export interface PartnerPayload {
  partner_website: string;
  id: string;
  logo_url: FormDataEntryValue | null;
}
