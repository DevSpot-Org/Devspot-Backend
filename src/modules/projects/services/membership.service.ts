import { randomUUID } from "crypto";

import { Novu } from "@novu/api";


import { HackathonParticipantsRepository } from "../../hackathon/repositories/hackathon-participants.repository";
import { ProjectInvitationsRepository } from "../repositories/project-invitations.repository";
import { ProjectJoinRequestsRepository } from "../repositories/project-join-requests.repository";
import { ProjectNotificationDataRepository } from "../repositories/project-notification-data.repository";
import { ProjectTeamMembersRepository } from "../repositories/project-team-members.repository";
import { ProjectsRepository } from "../repositories/projects.repository";
import { InviteParticipantRequest } from "../types";
import {
  InvitationExistsError,
  NoAcceptannceError,
  ProjectMembershipExistsError,
  ProjectNotFoundException,
  ProjectServiceError,
  UserNotFoundException,
} from "../utils/errors";
import { TokenService } from "./token.service";
import { UsersRepository } from "@/modules/user/repositories";
import { createClient } from "@/lib/supabase";

interface TeamMember {
  user_id: string;
  is_project_manager: boolean;
  is_new: boolean;
  is_deleted: boolean;
}

interface User {
  id: string;
  user_metadata?: {
    full_name?: string;
  };
}

export const handleInvitationService = async (
  projectId: number,
  userId: string,
  action: "approve" | "reject",
  transactionId: string
): Promise<any> => {
  const supabase = await createClient();
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(
    supabase
  );
  const projectNotificationDataRepository =
    new ProjectNotificationDataRepository(supabase);
  const tokenService = new TokenService(supabase);

  if (action === "approve") {
    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    const invitation = await projectTeamMembersRepository.getPendingInvitation(
      projectId,
      userId
    );
    if (!invitation) {
      try {
        await novu.messages.deleteByTransactionId(transactionId);
      } catch (error) {
        console.log(error);
      }

      throw new Error("Invalid Invitation");
    }

    const teamMember =
      await projectTeamMembersRepository.updateInvitationStatus(
        projectId,
        userId,
        "approve"
      );
    const { full_name, email } = teamMember.users || {};

    const notificationData =
      await projectNotificationDataRepository.getNotificationData(
        transactionId
      );

    const payload = Object.assign({}, notificationData?.payload, {
      status: "confirmed",
    });

    await novu.messages.deleteByTransactionId(transactionId);

    await novu.trigger({
      workflowId: "invite-user-to-project-flow-receiver",
      to: {
        subscriberId: userId,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    await tokenService.awardTokens({
      userId: userId,
      amount: 25,
      category: "accept_project_invitation",
      referenceId: `accept_project_invitation_${userId}`,
    });

    return null;
  } else {
    const invitation = await projectTeamMembersRepository.getPendingInvitation(
      projectId,
      userId
    );
    if (!invitation) throw new Error("Invalid Invitation");

    const teamMember =
      await projectTeamMembersRepository.updateInvitationStatus(
        projectId,
        userId,
        "reject"
      );
    const { full_name, email } = teamMember.users || {};

    const notificationData =
      await projectNotificationDataRepository.getNotificationData(
        transactionId
      );

    const payload = Object.assign({}, notificationData?.payload, {
      status: "rejected",
    });

    const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

    await novu.messages.deleteByTransactionId(transactionId);

    await novu.trigger({
      workflowId: "invite-user-to-project-flow-receiver",
      to: {
        subscriberId: userId,
        firstName: full_name ?? undefined,
        email: email ?? undefined,
      },
      payload,
    });

    return null;
  }
};

export const inviteParticipantService = async (
  projectId: number,
  payload: InviteParticipantRequest
): Promise<any> => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectInvitationsRepository = new ProjectInvitationsRepository(
    supabase
  );
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(
    supabase
  );
  const usersRepository = new UsersRepository(supabase);

  if (!payload.participant_id) {
    throw new Error("A Participant ID is required");
  }

  // Check if project exists
  const project = await projectsRepository.findById(projectId);
  if (!project) {
    throw new ProjectNotFoundException(projectId);
  }

  // Check if user exists
  const user = await usersRepository.findById(payload.participant_id);
  if (!user) {
    throw new UserNotFoundException(payload.participant_id);
  }

  // Check if project is accepting participants
  if (!project.accepting_participants) {
    throw new NoAcceptannceError(projectId);
  }

  // Check if user is already a team member
  const existingMember =
    await projectTeamMembersRepository.checkExistingMembership(
      projectId,
      payload.participant_id
    );
  if (existingMember) {
    throw new ProjectMembershipExistsError(projectId, payload.participant_id);
  }

  // Check if there's already a pending invitation
  const existingInvitation =
    await projectInvitationsRepository.findInvitationByProjectAndUser(
      projectId,
      payload.participant_id
    );
  if (existingInvitation) {
    throw new InvitationExistsError(projectId, payload.participant_id);
  }

  // Create the invitation
  const invitation = await projectInvitationsRepository.createInvitation(
    projectId,
    payload.participant_id,
    "member"
  );

  return invitation;
};

export const leaveProjectService = async (
  projectId: number,
  userId: string
): Promise<any> => {
  const supabase = await createClient();
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(
    supabase
  );
  const projectsRepository = new ProjectsRepository(supabase);

  // 1. Fetch the membership record for this user
  const member = await projectTeamMembersRepository.checkExistingMembership(
    projectId,
    userId
  );
  if (!member) {
    throw new Error(`User ${userId} is not a member of project ${projectId}.`);
  }

  // If they're NOT the PM, just delete their membership
  if (!member.is_project_manager) {
    await projectTeamMembersRepository.removeMember(projectId, userId);
    await projectTeamMembersRepository.redistributePrizeAllocation(projectId);

    return null;
  }

  // 2. They are the PM → find next member to promote.
  //    Here we pick the one with the earliest `created_at` timestamp.
  const nextMember = await projectTeamMembersRepository.findNextMemberToPromote(
    projectId,
    userId
  );

  if (!nextMember) {
    // No one left to promote → delete the whole project
    await projectsRepository.delete(projectId);
    return null;
  }

  // 3. Promote the next member to PM
  await projectTeamMembersRepository.promoteToProjectManager(
    projectId,
    nextMember.user_id
  );

  // 4. Delete the old PM's membership
  await projectTeamMembersRepository.removeMember(projectId, userId);
  await projectTeamMembersRepository.redistributePrizeAllocation(projectId);

  return nextMember;
};

export const requestToJoinService = async (
  projectId: number,
  userId: string,
  message?: string
): Promise<any> => {
  const supabase = await createClient();
  const projectJoinRequestsRepository = new ProjectJoinRequestsRepository(
    supabase
  );

  // Check if request already exists
  const existingRequest =
    await projectJoinRequestsRepository.findJoinRequestByProjectAndUser(
      projectId,
      userId
    );
  if (existingRequest) {
    throw new Error("Join request already exists");
  }

  await projectJoinRequestsRepository.createJoinRequest(
    projectId,
    userId,
    message
  );

  return { success: true, message: "Join request submitted successfully" };
};

export const requestToJoinProjectService = async (
  projectId: number,
  participantId: string
) => {
  try {
    const supabase = await createClient();
    const projectsRepository = new ProjectsRepository(supabase);
    const usersRepository = new UsersRepository(supabase);
    const projectTeamMembersRepository = new ProjectTeamMembersRepository(
      supabase
    );
    const projectInvitationsRepository = new ProjectInvitationsRepository(
      supabase
    );

    // Check if project exists
    const project = await projectsRepository.findProjectById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Check if user exists
    const user = await usersRepository.findById(participantId);
    if (!user) {
      throw new UserNotFoundException(participantId);
    }

    if (!project.accepting_participants) {
      throw new NoAcceptannceError(projectId);
    }

    // Check if user is already a team member
    const existingMember =
      await projectTeamMembersRepository.checkExistingMembership(
        projectId,
        participantId
      );
    if (existingMember) {
      throw new ProjectMembershipExistsError(projectId, participantId);
    }

    // Check if invitation already exists
    const existingInvitation =
      await projectInvitationsRepository.checkExistingInvitation(
        projectId,
        participantId
      );
    if (existingInvitation) {
      throw new InvitationExistsError(projectId, participantId);
    }

    // Create the invitation
    const invitation = await projectInvitationsRepository.createRequestToJoin(
      projectId,
      participantId
    );

    return invitation;
  } catch (error) {
    if (error instanceof ProjectServiceError) {
      throw error;
    }

    // Handle unexpected errors
    console.error("Error requesting to join project:", error);

    throw new ProjectServiceError(
      "Failed to request to join project. Please try again later."
    );
  }
};

export const updateProjectTeamService = async (
  projectId: number,
  sender: User,
  origin: string,
  team: TeamMember[] | undefined
) => {
  try {
    const supabase = await createClient();
    const projectsRepository = new ProjectsRepository(supabase);
    const projectTeamMembersRepository = new ProjectTeamMembersRepository(
      supabase
    );
    const usersRepository = new UsersRepository(supabase);
    const hackathonParticipantsRepository = new HackathonParticipantsRepository(
      supabase
    );
    const projectNotificationDataRepository =
      new ProjectNotificationDataRepository(supabase);

    // 1) Ensure project exists
    const project = await projectsRepository.findProjectWithHackathon(
      projectId
    );
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    if (!team || team.length === 0) {
      // nothing to do
      return { inserted: 0, updated: 0, deleted: 0 };
    }

    // 2) Partition the incoming diffs
    const toInsert = team.filter((m) => m.is_new && !m.is_deleted);
    const toDelete = team.filter((m) => m.is_deleted);
    const toUpdate = team.filter((m) => !m.is_new && !m.is_deleted);

    let inserted = 0;
    let deleted = 0;
    let updated = 0;

    // 3) Inserts
    if (toInsert.length > 0) {
      const novu = new Novu({ secretKey: process.env.NOVU_API_KEY! });

      const payload = toInsert.map((m) => ({
        project_id: projectId,
        user_id: m.user_id,
        is_project_manager: m.is_project_manager,
      }));

      const insertedRows = await projectTeamMembersRepository.insertTeamMembers(
        projectId,
        payload
      );

      const userIds = insertedRows.map((r) => r.user_id);
      const users = await Promise.all(
        userIds.map(async (userId) => {
          try {
            return await usersRepository.findById(userId);
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            return null;
          }
        })
      );

      const validUsers = users.filter(Boolean);

      // 3. Trigger notifications in parallel
      await Promise.all(
        validUsers.map(async (user) => {
          try {
            const hackathonParticipant =
              await hackathonParticipantsRepository.checkParticipantStatus(
                user.id,
                project.hackathons.id
              );

            const selectedUser = insertedRows.find(
              (r) => r.user_id === user.id
            );

            const transactionId = randomUUID();
            const is_hackathon_participant = Boolean(hackathonParticipant);

            const notificationPayload = {
              sender_id: sender?.id,
              sender_name: sender?.user_metadata?.full_name,
              sender_profile: `${origin}/en/profile/${sender.id}`,
              hackathon_id: project?.hackathons?.id,
              hackathon_name: project?.hackathons?.name,
              hackathon_profile: `${origin}/en/hackathons/${project?.hackathons?.id}`,
              project_id: project?.id,
              is_hackathon_participant,
              status: selectedUser?.status,
              transaction_id: transactionId,
            };

            const { result } = await novu.trigger({
              workflowId: is_hackathon_participant
                ? "invite-user-to-project-flow-receiver"
                : "invite-user-to-project-flow-receiver-not-in-hackathon",
              transactionId: transactionId,
              to: {
                subscriberId: user?.id,
                firstName: user?.full_name ?? undefined,
                email: user?.email ?? undefined,
              },
              payload: notificationPayload,
            });

            if (result.status === "processed") {
              await projectNotificationDataRepository.insertNotificationData(
                result.transactionId || transactionId,
                notificationPayload
              );
            }
          } catch (error) {
            console.error(
              `Failed to process notification for user ${user.id}:`,
              error
            );
          }
        })
      );

      inserted = Array.isArray(insertedRows) ? insertedRows.length : 0;
    }

    // 4) Deletes
    if (toDelete.length > 0) {
      const userIds = toDelete.map((m) => m.user_id);
      const deletedRows = await projectTeamMembersRepository.deleteTeamMembers(
        projectId,
        userIds
      );
      deleted = deletedRows.length;
    }

    // 5) Updates
    for (const member of toUpdate) {
      await projectTeamMembersRepository.updateTeamMemberManagerStatus(
        projectId,
        member.user_id,
        member.is_project_manager
      );
      updated++;
    }

    return { inserted, updated, deleted };
  } catch (err) {
    // If we already threw a ProjectServiceError (or subclass), rethrow it
    if (err instanceof ProjectServiceError) {
      throw err;
    }
    console.error("Error updating project team:", err);
    throw new ProjectServiceError(
      "Failed to update project team. Please try again later."
    );
  }
};
