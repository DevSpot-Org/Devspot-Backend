import { HackathonApplicationMethodEnum } from "@/types/entities";

// Request and Response interfaces for project operations
export interface ProjectByIdRequest {
  id: string;
}

export interface ProjectByIdResponse {
  id: number;
  name: string;
  description?: string;
  tagline?: string;
  logo_url?: string;
  hackathon_id: number;
  technologies: string[];
  created_at: string;
  updated_at: string;
  hackathons?: {
    id: number;
    name: string;
  };
  project_team_members?: Array<{
    id: number;
    users: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  }>;
  project_challenges?: Array<{
    hackathon_challenges: {
      id: number;
      title: string;
      description?: string;
    };
  }>;
}

export interface ProjectsByOwnerRequest {
  technologyOwnerId: string;
}

export interface ProjectsByOwnerResponse {
  projects: ProjectByIdResponse[];
}

// Membership-related interfaces
export interface HandleInvitationRequest {
  projectId: string;
  action: "accept" | "decline";
}

export interface InviteParticipantRequest {
  participant_id: string;
}

export interface LeaveProjectRequest {
  projectId: string;
}

export interface RequestToJoinRequest {
  projectId: string;
  message?: string;
}

export interface TeamRequest {
  projectId: string;
}

export interface TeamResponse {
  members: Array<{
    id: number;
    user_id: string;
    role: string;
    status: string;
    joined_at: string;
    users: {
      id: string;
      full_name: string;
      avatar_url?: string;
      email: string;
    };
  }>;
  invitations: Array<{
    id: number;
    user_id: string;
    role: string;
    status: string;
    created_at: string;
  }>;
}

// Media-related interfaces
export interface UploadHeaderImageRequest {
  projectId: string;
  file: File;
}

export interface UploadLogoRequest {
  projectId: string;
  file: File;
}

export interface UploadVideoRequest {
  projectId: string;
  file: File;
}

export interface DeleteMediaRequest {
  projectId: string;
}

export interface MediaResponse {
  success: boolean;
  message: string;
  url?: string;
  imageUrl?: string;
}

// Legacy-style response for header image operations
export interface HeaderImageResponse {
  imageUrl: string;
}

export interface ProjectTeamMembersRepositoryInterface {
  findByProjectId(projectId: number): Promise<any[]>;
  addMember(projectId: number, userId: string, role?: string): Promise<any>;
  removeMember(projectId: number, userId: string): Promise<void>;
  updateMemberStatus(projectId: number, userId: string, status: string): Promise<any>;
  findInvitationsByProjectId(projectId: number): Promise<any[]>;
  checkProjectManagerStatus(projectId: number, userId: string): Promise<any>;
  updatePrizeAllocation(projectId: number, userId: string, prizeAllocation: number): Promise<any>;
  findAllMembersByProjectId(projectId: number): Promise<any[]>;
  checkTeamMemberStatus(projectId: number, userId: string): Promise<any>;
  checkExistingMembership(projectId: number, userId: string): Promise<any>;
  getConfirmedMembers(projectId: number): Promise<any[]>;
  findNextMemberToPromote(projectId: number, excludeUserId: string): Promise<any>;
  promoteToProjectManager(projectId: number, userId: string): Promise<void>;
  redistributePrizeAllocation(projectId: number): Promise<void>;
  insertTeamMembers(
    projectId: number,
    members: Array<{ user_id: string; is_project_manager: boolean }>
  ): Promise<any[]>;
  deleteTeamMembers(projectId: number, userIds: string[]): Promise<any[]>;
  updateTeamMemberManagerStatus(
    projectId: number,
    userId: string,
    isProjectManager: boolean
  ): Promise<void>;
  getPendingInvitation(projectId: number, userId: string): Promise<any>;
  updateInvitationStatus(
    projectId: number,
    userId: string,
    status: "approve" | "reject"
  ): Promise<any>;
}

// New types for management operations
export interface UpdateProjectAllocationRequest {
  projectId: string;
  allocationData: Array<{
    user_id: string;
    prize_allocation: number;
  }>;
}

export interface SubmitProjectRequest {
  projectId: string;
}

export interface UpdateProjectAllocationResponse {
  success: boolean;
  message: string;
}

export interface ProjectInvitationsRepositoryInterface {
  createInvitation(projectId: number, userId: string, role?: string): Promise<any>;
  updateInvitationStatus(invitationId: number, status: string): Promise<any>;
  findInvitationById(invitationId: number): Promise<any>;
  findInvitationByProjectAndUser(projectId: number, userId: string): Promise<any>;
  findInvitationByProjectAndEmail(projectId: number, email: string): Promise<any>;
  findInvitationsByProjectId(projectId: number): Promise<any[]>;
  checkExistingInvitation(projectId: number, userId: string): Promise<any>;
  createRequestToJoin(projectId: number, userId: string): Promise<any>;
}

export interface ProjectJoinRequestsRepositoryInterface {
  createJoinRequest(projectId: number, userId: string, message?: string): Promise<any>;
  updateJoinRequestStatus(requestId: number, status: string): Promise<any>;
  findJoinRequestByProjectAndUser(projectId: number, userId: string): Promise<any>;
  findJoinRequestsByProject(projectId: number): Promise<any[]>;
}

// Repository interfaces for media operations
export interface ProjectMediaRepositoryInterface {
  updateHeaderImage(projectId: number, imageUrl: string): Promise<any>;
  updateLogo(projectId: number, logoUrl: string): Promise<any>;
  updateVideo(projectId: number, videoUrl: string): Promise<any>;
  deleteHeaderImage(projectId: number): Promise<any>;
  deleteLogo(projectId: number): Promise<any>;
  deleteVideo(projectId: number): Promise<any>;
  getProjectById(projectId: number): Promise<any>;
  // Legacy-style methods (exact same as legacy implementation)
  updateProjectHeaderUrl(projectId: number, headerUrl: string): Promise<void>;
  deleteProjectHeaderUrl(projectId: number): Promise<void>;
  updateProjectLogoUrl(projectId: number, logoUrl: string): Promise<void>;
  deleteProjectLogoUrl(projectId: number): Promise<void>;
  updateProjectVideoUrl(projectId: number, videoUrl: string): Promise<void>;
  deleteProjectVideoUrl(projectId: number): Promise<void>;
}

// Repository interface for core project operations
export interface ProjectsRepositoryInterface {
  findById(id: number): Promise<any | null>;
  update(id: number, updateData: any): Promise<any>;
  delete(id: number): Promise<any>;
  submitProjectWithChallenges(projectId: number): Promise<any>;
  getAllSubmittedProjects(): Promise<any[]>;
  findProjectById(projectId: number): Promise<any>;
  findProjectWithHackathon(projectId: number): Promise<any>;
  getHackathonProjects(hackathonId: number, options?: any, userId?: string): Promise<any>;
  getHackathonProjectsSearch(hackathonId: number): Promise<any>;
}

// Repository interface for judging bot scores
export interface JudgingBotScoresRepositoryInterface {
  createBotScore(challengeId: number, projectId: number): Promise<any>;
}

export interface ProjectNotificationDataRepositoryInterface {
  insertNotificationData(transactionId: string, payload: any): Promise<any>;
  getNotificationData(transactionId: string): Promise<any>;
}

export type StakeRefundEvent = "check_in" | "project_submission" | "event_end" | "manual";

export interface ApplicationAndStakingPayload {
  accepting_participants: boolean;
  participants_limit: number;
  stake_amount: number;
  stake_refund_event: StakeRefundEvent;
  questions: string[];
  application_method: HackathonApplicationMethodEnum;
}
