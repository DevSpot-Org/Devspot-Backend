import { Database } from "./database";
import { ConnectedAccount } from "./profile";

export type TableNames = keyof Database["public"]["Tables"];

export type Nonces = Database["public"]["Tables"]["nonces"]["Row"];
export type UserSkills = {
  experience: string[];
  technology: string[];
};
export type ParticipantProfile =
  Database["public"]["Tables"]["participant_profile"]["Row"] & {
    skills: UserSkills;
    connected_accounts: ConnectedAccount[];
  };
export type ParticipantWallets =
  Database["public"]["Tables"]["participant_wallets"]["Row"];
export type ParticipantTransactions =
  Database["public"]["Tables"]["participant_transactions"]["Row"];
export type UserParticipantRoles =
  Database["public"]["Tables"]["user_participant_roles"]["Row"];
export type ParticipantRoles =
  Database["public"]["Tables"]["participant_roles"]["Row"];
export type TechnologyOwners =
  Database["public"]["Tables"]["technology_owners"]["Row"] & {
    hackathons?: Hackathons[];
    is_following?: boolean;
  };

export type TechnologyOwnersUsers =
  Database["public"]["Tables"]["technology_owner_users"]["Row"];
export type Hackathons = Database["public"]["Tables"]["hackathons"]["Row"] & {
  vips?: HackathonVips;
  challenges?: HackathonChallenges[];
  resources?: HackathonResources[];
  organizer: TechnologyOwners;
  number_of_participants?: number;
  upcomingSession?: HackathonSessions;
  application_status?: "pending" | "accepted";
  looking_for_teammates?: boolean;
  projectCounts?: { total: number; submitted: number };
  stake_refund_event: string | null;
  questions: {
    id: number;
    hackathon_id: number;
    question: string;
    order: number;
    created_at: string;
    updated_at: string;
  }[];
};

export type HackathonParticipants =
  Database["public"]["Tables"]["hackathon_participants"]["Row"] & {
    users: Users;
    following?: boolean;
    tokenBalance?: number;
  };
export type HackathonApplicationQuestions =
  Database["public"]["Tables"]["hackathon_application_questions"]["Row"];
export type HackathonApplicationAnswers =
  Database["public"]["Tables"]["hackathon_application_answers"]["Row"];
export type HackathonStakes =
  Database["public"]["Tables"]["hackathon_stakes"]["Row"];
export type HackathonStakesStatusEnum =
  | Database["public"]["Enums"]["hackathon_stakes_status"];
interface Location {
  link: string;
  name: string;
}
export type HackathonSessions =
  Database["public"]["Tables"]["hackathon_sessions"]["Row"] & {
    rsvpd: boolean;
    upcoming: boolean;
    location: Location[];
  };
export type HackathonUserSessionRsvp =
  Database["public"]["Tables"]["hackathon_user_session_rsvp"]["Row"];
export type HackathonChallenges =
  Database["public"]["Tables"]["hackathon_challenges"]["Row"] & {
    prizes: HackathonChallengeBounties[];
  };
export type HackathonChallengeBounties =
  Database["public"]["Tables"]["hackathon_challenge_bounties"]["Row"];
export type HackathonVips =
  Database["public"]["Tables"]["hackathon_vips"]["Row"] & {
    users: Users;
    hackathon_vip_roles: HackathonVipRoles[];
    challengeIds: number[];
    invitation: false;
  };
export type HackathonVipsInvitation =
  Database["public"]["Tables"]["hackathon_vips_invitations"]["Row"] & {
    invitation: true;
    users: Users;
  };
export type HackathonVipRoles =
  Database["public"]["Tables"]["hackathon_vip_roles"]["Row"] & {
    roles: Roles;
  };
export type Roles = Database["public"]["Tables"]["roles"]["Row"];
export type HackathonFaqs =
  Database["public"]["Tables"]["hackathon_faqs"]["Row"];
export type HackathonAnnouncements =
  Database["public"]["Tables"]["hackathon_announcements"]["Row"];
export type HackathonCommunicationLinks =
  Database["public"]["Tables"]["hackathon_communication_links"]["Row"];
export type HackathonChallengeResources =
  Database["public"]["Tables"]["hackathon_resource_challenges"]["Row"];
export type HackathonResources =
  Database["public"]["Tables"]["hackathon_resources"]["Row"] & {
    challenges: HackathonChallengeResources[];
  };
export type TeamMemberships =
  Database["public"]["Tables"]["project_team_members"]["Row"] & {
    users: Users;
  };
export type TeamInvitations =
  Database["public"]["Tables"]["project_invitations"]["Row"];
export type ProjectChallenges =
  Database["public"]["Tables"]["project_challenges"]["Row"] & {
    challenge: HackathonChallenges;
    hackathon_challenges: HackathonChallenges;
  };
export type Projects = Database["public"]["Tables"]["projects"]["Row"] & {
  challenges?: Partial<ProjectChallenges>[];
  is_owner?: boolean;
  project_completion_rate?: number;
  hackathons?: Partial<Hackathons>;
  project_challenges?: Partial<ProjectChallenges>[];
  project_challenge?: Partial<ProjectChallenges>;
  project_team_members: TeamMemberships[];
};

export type Users = Database["public"]["Tables"]["users"]["Row"] & {
  profile?: ParticipantProfile;
  project_count?: number;
  in_hackathon?: boolean;
  project_team_members: TeamMemberships[];
  wallets: ParticipantWallets[];
  roles?: (UserParticipantRoles & {
    participant_roles: ParticipantRoles;
  })[];
};

export type Judgings = Database["public"]["Tables"]["judgings"]["Row"] & {
  hackathons?: Partial<Hackathons>;
};

export type JudgingEntries =
  Database["public"]["Tables"]["judging_entries"]["Row"] & {
    projects: Projects;
  };

export type JudgingBotScores =
  Database["public"]["Tables"]["judging_bot_scores"]["Row"];

export interface JudgingProjectFlat {
  // fields from judging_entries
  id: JudgingEntries["id"];
  judging_status: JudgingEntries["judging_status"];
  judging_id: JudgingEntries["judging_id"];
  project_id: JudgingEntries["project_id"];
  can_be_edited?: boolean;
  judging_bot_scores?: JudgingBotScores;
  // the project, minus the array of challenges, plus exactly one challenge
  projects: Omit<Projects, "project_challenges"> & {
    project_challenge: ProjectChallenges;
  };
}

export type UserHackathonChallengeFeedback =
  Database["public"]["Tables"]["hackathon_challenge_feedback"]["Row"];

export type TechnologyStatusEnum =
  | Database["public"]["Enums"]["technology_status"];
export type HackathonApplicationMethodEnum =
  | Database["public"]["Enums"]["hackathon_application_method"];

export type Technologies = Database["public"]["Tables"]["technologies"]["Row"];
export type HackathonCommunityPartners =
  Database["public"]["Tables"]["hackathon_community_partners"]["Row"];
