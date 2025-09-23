import { createClient } from "@/lib/supabase";
import { UsersRepository } from "@/modules/user/repositories/users.repository";
import { TechnologyOwnerUsersRepository } from "../repositories/technology-owner-users.repository";
import { TechnologyOwnersRepository } from "../repositories/technology-owners.repository";
import { InviteMemberPayload } from "../types";

export const inviteMemberToTechnologyOwnerService = async (
  technologyOwnerId: number,
  payload: InviteMemberPayload
): Promise<any> => {
  const supabase = await createClient();
  const technologyOwnersRepository = new TechnologyOwnersRepository(supabase);
  const technologyOwnerUsersRepository = new TechnologyOwnerUsersRepository(supabase);
  const usersRepository = new UsersRepository(supabase);

  // Get technology owner name for notifications
  const technologyOwner = await technologyOwnersRepository.findById(technologyOwnerId);
  if (!technologyOwner) {
    throw new Error("Technology Owner not found");
  }

  const results = [];

  // Handle email invitation
  if (payload.email) {
    const user = await usersRepository.findUserByEmail(payload.email);

    if (user) {
      // User exists - add them directly
      await technologyOwnerUsersRepository.insertUserInvitation(
        user.id,
        technologyOwnerId,
        "accepted"
      );

      // Note: Novu notification and email sending would go here
      // For now, we'll keep the core logic without external dependencies

      results.push({
        email: payload.email,
        success: true,
        userExists: true,
      });
    } else {
      await technologyOwnerUsersRepository.insertEmailInvitation(
        payload.email,
        technologyOwnerId,
        "pending"
      );

      // Note: Email sending would go here
      // For now, we'll keep the core logic without external dependencies

      results.push({
        email: payload.email,
        success: true,
        userExists: false,
      });
    }
  }

  // Handle selected users
  if (payload.selectedUsers?.length) {
    // Get users by IDs
    const users = await usersRepository.findUsersByIds(payload.selectedUsers);

    if (users?.length) {
      // Prepare invitations data
      const invitations = users.map((user) => ({
        user_id: user.id,
        technology_owner_id: technologyOwnerId,
        status: "accepted" as any,
      }));

      try {
        // Database upsert
        await technologyOwnerUsersRepository.upsertUserInvitations(invitations);

        // Note: Novu notifications and email sending would go here
        // For now, we'll keep the core logic without external dependencies
      } catch (error) {
        console.error("Unexpected error in user invitation process:", error);
      }

      // Add results for all users
      results.push(
        ...users.map((user) => ({
          userId: user.id,
          success: true,
          userExists: true,
        }))
      );
    }
  }

  return {
    success: true,
    results,
  };
};
