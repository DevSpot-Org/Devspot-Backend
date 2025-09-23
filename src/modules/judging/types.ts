export interface FlagProjectRequest {
  challenge_id: number;
  flag_reason: string;
  flag_comments?: string;
  status?: "unflag";
}

export interface FlagProjectParams {
  judging_id: number;
  project_id: number;
}

export interface CreateJudgingRequest {
  user_id: string;
  hackathon_id: number;
}

export interface CreateJudgingResponse {
  id: number;
  user_id: string;
  hackathon_id: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignProjectsRequest {
  botScoreIds: number[];
}

export interface AssignProjectsResponse {
  successfully_assigned: number;
  skipped: number;
  errors?: Array<{ botScoreId: number; error: string }>;
}

export interface GetProjectDetailsParams {
  judging_id: number;
  project_id: number;
  challenge_id: number;
}

export interface GetProjectDetailsResponse {
  id: number;
  judging_id: number;
  project_id: number;
  challenge_id: number;
  score: string;
  general_comments: string;
  technical_feedback: string;
  ux_feedback: string;
  business_feedback: string;
  innovation_feedback: string;
  flagged_reason: string | null;
  flagged_comments: string | null;
  judging_status: string;
  can_be_edited: boolean;
  judging_bot_scores: {
    ai_judged: boolean;
  } | null;
  projects: {
    id: number;
    name: string;
    description: string;
    submitted: boolean;
    project_team_members: any[];
    project_challenge: any;
    project_challenges: any[];
    hackathons: {
      name: string;
      team_limit: number;
    };
  };
}

export interface SubmitJudgingEntryParams {
  judging_id: number;
  project_id: number;
}

export interface SubmitJudgingEntryRequest {
  challenge_id: number;
  score: number;
  technical_feedback: string;
  technical_score: number;
  business_feedback: string;
  business_score: number;
  innovation_feedback: string;
  innovation_score: number;
  ux_feedback: string;
  ux_score: number;
  general_comments: string;
}

export interface SubmitJudgingEntryResponse {
  id: number;
  created_at: string;
  judging_id: number;
  project_id: number;
  challenge_id: number;
  score: number;
  technical_feedback: string;
  technical_score: number;
  business_feedback: string;
  business_score: number;
  innovation_feedback: string;
  innovation_score: number;
  ux_feedback: string;
  ux_score: number;
  general_comments: string;
  judging_status: string;
}

export interface UpdateJudgingEntryParams {
  judging_id: number;
  project_id: number;
}

export interface UpdateJudgingEntryRequest {
  challenge_id: number;
  score?: number;
  technical_feedback?: string;
  business_feedback?: string;
  innovation_feedback?: string;
  ux_feedback?: string;
  general_comments?: string;
  business_score?: number;
  innovation_score?: number;
  ux_score?: number;
  technical_score?: number;
  judging_status?: "judged" | "needs_review";
}

export interface UpdateJudgingEntryResponse {
  id: number;
  created_at: string;
  judging_id: number;
  project_id: number;
  challenge_id: number;
  score: number;
  technical_feedback: string;
  technical_score: number;
  business_feedback: string;
  business_score: number;
  innovation_feedback: string;
  innovation_score: number;
  ux_feedback: string;
  ux_score: number;
  general_comments: string;
  judging_status: string;
  updated_at: string;
}

export interface SubmitJudgingParams {
  judging_id: number;
}

export interface SubmitJudgingResponse {
  id: number;
  user_id: string;
  hackathon_id: number;
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export interface GetJudgingProgressParams {
  judging_id: number;
}

export interface GetJudgingProgressResponse {
  total: number;
  judged: number;
  flagged: number;
}

export interface GetJudgingChallengesParams {
  judging_id: number;
}

export interface GetJudgingChallengesResponse {
  id: number;
  challenge_name: string;
  sponsors: any[];
}

export interface GetUserJudgingsParams {
  user_id: string;
}

export interface GetUserJudgingsResponse {
  id: number;
  hackathon_id: number;
  is_submitted: boolean;
  created_at: string;
  update_at: string | null;
  user_id: string;
  deadline: string | null;
  hackathons: {
    id: number;
    name: string;
    organizer: {
      id: number;
      name: string;
      logo_url: string;
    };
    number_of_participants: number;
  };
}

export interface GetJudgingProjectsParams {
  judging_id: number;
  user_id: string;
}

export interface GetJudgingProjectsResponse {
  [key: string]: {
    challenge_name: string;
    projects: any[];
  };
}

export interface GetJudgingProjectsUngroupedParams {
  judging_id: number;
  user_id: string;
}

export interface GetJudgingProjectsUngroupedResponse {
  id: number;
  judging_status: string;
  judging_id: number;
  project_id: number;
  challenge_id: number;
  score: string;
  project_hidden: boolean;
  can_be_edited: boolean;
  judging_bot_scores: {
    id: number;
    ai_judged: boolean;
    score: string;
  } | null;
  projects: {
    id: number;
    name: string;
    description: string;
    submitted: boolean;
    project_team_members: any[];
    project_challenge: any;
    project_challenges: any[];
    hackathons: {
      name: string;
      organizer: any;
    };
  };
}

export interface GetJudgingPrizesParams {
  judging_id: number;
  user_id: string;
}

export interface GetJudgingPrizesResponse {
  challenges: {
    id: number;
    challenge_name: string;
    judges: {
      id: string;
      name: string;
      logo: string | null;
      progress_percentage: number;
    }[];
  }[];
}

export interface GetHackathonJudgesSearchParams {
  hackathon_id: number;
}

export interface GetHackathonJudgesSearchResponse {
  name: string;
  logo: string | null;
}
