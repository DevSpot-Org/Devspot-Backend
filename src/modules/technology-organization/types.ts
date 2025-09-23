import { Database } from "@/types/database";

type TechnologyOwners = Database["public"]["Tables"]["technology_owners"]["Row"];
type Hackathons = Database["public"]["Tables"]["hackathons"]["Row"];
type Projects = Database["public"]["Tables"]["projects"]["Row"];

// Request and Response interfaces for profile operations
export interface TechnologyOwnerByIdRequest {
  id: string;
}

export interface TechnologyOwnerByIdResponse {
  id: number;
  name: string;
  logo?: string;
  created_at: string;
  updated_at: string;
  description?: string;
  discord_url?: string;
  domain?: string;
  facebook_url?: string;
  instagram_url?: string;
  link?: string;
  linkedin_url?: string;
  location?: string;
  no_of_upcoming_hackathons: number;
  num_employees?: string;
  slack_url?: string;
  tagline?: string;
  technologies?: string[];
  telegram_url?: string;
  x_url?: string;
  youtube_url?: string;
  banner_url?: string;
  company_industry?: string;
  hackathons: any[];
  is_following: boolean;
}

export interface TechnologyOwnerHackathonsRequest {
  id: string;
  page?: string;
  page_size?: string;
}

export interface TechnologyOwnerHackathonsResponse {
  message: string;
  data: {
    items: any[];
    pageNumber: number;
    totalPages: number;
    totalItems: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface TechnologyOwnerProjectsRequest {
  id: string;
}

export interface TechnologyOwnerProjectsResponse {
  id: number;
  name: string;
  description?: string;
  tagline?: string;
  logo_url?: string;
  hackathon_id?: number;
  technologies?: string[];
  hackathons?: {
    id: number;
    name: string;
  };
  project_team_members?: any[];
  project_challenges?: any[];
}

export interface TechnologyOwnerSearchRequest {
  search_term: string;
}

export interface TechnologyOwnerSearchResponse {
  message: string;
  data: TechnologyOwners[];
}

export interface TechnologyOwnerFollowRequest {
  id: string;
}

export interface TechnologyOwnerFollowResponse {
  success: boolean;
  action: string;
}

export interface TechnologyOwnerUpdateRequest {
  id: string;
  formData: FormData;
}

export interface TechnologyOwnerUpdateResponse {
  id: number;
  name?: string;
  description?: string;
  domain?: string;
  location?: string;
  num_employees?: string;
  company_industry?: string;
  tagline?: string;
  link?: string;
  discord_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  slack_url?: string;
  telegram_url?: string;
  x_url?: string;
  youtube_url?: string;
  technologies?: string[];
  logo?: string;
  banner_url?: string;
}

// Request and Response interfaces for invite operations
export interface InviteMemberRequest {
  id: string;
  body: InviteMemberPayload;
}

export interface InviteMemberPayload {
  email?: string;
  selectedUsers?: string[];
}

export interface InviteMemberResponse {
  success: boolean;
  results: Array<{
    email?: string;
    userId?: string;
    success: boolean;
    userExists: boolean;
  }>;
}

// Repository interfaces
export interface TechnologyOwnersRepositoryInterface {
  findById(id: number): Promise<TechnologyOwners | null>;
  findByIdWithRelations(id: number): Promise<TechnologyOwners | null>;
  findAll(): Promise<TechnologyOwners[]>;
  update(id: number, params: any): Promise<TechnologyOwners>;
  searchByName(searchTerm: string): Promise<TechnologyOwners[]>;
}

export interface TechnologyOwnerUserFollowingRepositoryInterface {
  findFollowStatus(technologyOwnerId: number, userId: string): Promise<boolean>;
  toggleFollow(
    technologyOwnerId: number,
    userId: string
  ): Promise<{ success: boolean; action: string }>;
}

export interface TechnologyOwnerUsersRepositoryInterface {
  insertUserInvitation(userId: string, technologyOwnerId: number, status?: string): Promise<any>;
  insertEmailInvitation(email: string, technologyOwnerId: number, status?: string): Promise<any>;
  upsertUserInvitations(
    invitations: Array<{ user_id: string; technology_owner_id: number; status: string }>
  ): Promise<any>;
}
