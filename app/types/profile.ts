import {
  ParticipantProfile,
  ParticipantRoles,
  TechnologyOwners,
  TechnologyOwnersUsers,
  UserParticipantRoles,
  Users,
} from "@/types/entities";

export type TechnologyOwnersWithUsers = TechnologyOwners & {
  technology_owner_users: (TechnologyOwnersUsers & { users: Users })[];
};

export type TechnologyOrganization = {
  id: number;
  technology_owners: TechnologyOwnersWithUsers;
  technology_owner_id: number;
};

// Name Properly

export interface UserProfile extends Users {
  profile: ParticipantProfile;
  roles: (UserParticipantRoles & {
    participant_roles: ParticipantRoles;
  })[];
  technology_organizations: TechnologyOrganization[];
}

export interface UserSkills {
  experience: string[];
  technologies: string[];
}
export type DeveloperAccounts = {
  Gitlab: {
    url: string;
    repository: number;
    followers: number;
  };
  GitHub: {
    url: string;
    publicRepos: number;
    followers: number;
    following: number;
  };
  "Stack Overflow": {
    badges: number;
    upvotes: number;
    answers: number;
    questions: number;
    url: string;
  };
  HackerRank: {
    rank: string;
    url: string;
    global_rank: number;
    challenges: number;
  };
  Behance: {
    project_views: number;
    url: string;
    followers: number;
    appreciation: number;
  };
  DevTo: {
    url: string;
    articles: number;
    followers: number;
  };
  Dribble: {
    url: string;
    shots: number;
    followers: number;
    liked_shots: number;
  };
};

export type Person = {
  profile_picture: string;
  name: string;
  role: string;
  location: string;
  score: number;
  skills: string[];
};

export type Project = {
  project: {
    projectName: string;
    challengeName: string;
    teamMembers: {
      firstName: string;
      lastName: string;
      profilePicture: string;
    }[];
    ranking: string;
    description: string;
    skills: string[];
    image: string;
  };
};

export type GithubAccount = {
  following: number;
  followers: number;
  repository: number;
  url: string;
};

export type Spotify = {
  followers: number;
  playlist: number;
  url: string;
  top_tracks: { name: string; artist: string };
  currently_playing: {
    name: string;
    artist: string;
    album: string;
    id: string;
  } | null;
  last_played_track: {
    name: string;
    artist: string;
    album: string;
    id: string;
  } | null;
};

export type GitlabAccount = {
  followers: number;
  repository: number;
  url: string;
};

export type DribbbleAccount = {
  shots: number;
  liked_shots: number;
  followers: number;
  url: string;
};

export type StackOverflowAccount = {
  upvote: number;
  answers: number;
  questions: number;
  reputation: number;
  url: string;
};

export type ConnectedAccount =
  | { github: GithubAccount }
  | { gitlab: GitlabAccount }
  | { dribble: DribbbleAccount }
  | { stack_overflow: StackOverflowAccount }
  | { spotify: Spotify }
  | { linkedin_oidc: {} };

export interface ProjectDataType {
  id: string;
  title: string;
  mission: string;
  description: string;
  logo: string;
  teamSize: number;
  hasTrophy: boolean;
  tags: string[];
  contributors: { name: string; pic: string }[];
}

export interface Hackathon {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  type: "in-person" | "virtual";
  location: string;
  startDate: string;
  endDate: string;
  participants: number;
  status: "live" | "complete";
  hasProject?: boolean;
}

export interface DiscussionThread {
  id: string;
  title: string;
  details: string;
  date: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  responseCount: number;
}

export interface AboutProfileData {
  profile: {
    about: string | null;
    roles: string[] | null;
    location: string | null;
    years_of_experience: string;
    website_url: string | null;
    linkedin_url: string | null;
    accounts: ConnectedAccount[];
  };
}

export interface AboutProfileUpdateType {
  about: string;
  roles: string[];
  location: string;
  yearsOfExperience?: number | null;
  websiteUrl: string;
  linkedInUrl: string;
}

export interface TransactionDataType {
  id: string;
  description: string;
  amount: number;
  date: Date;
  type: "withdraw" | "deposit";
}
