import { createClient } from "@/lib/supabase";
import { UserProfileRepository, UsersRepository } from "@/modules/user/repositories";
import { ParticipantProfile } from "@/types/entities";
import { TokenService } from "@/utils/tokenService";
import { ParticipantRolesRepository } from "../repositories/participant-roles.repository";
import { validateUpdateParticipantProfileBody } from "../validators/profile.validators";

export const getAuthUserProfileService = async (identifier: string) => {
  const supabase = await createClient();
  const userRepo = new UsersRepository(supabase);
  const profileRepo = new UserProfileRepository(supabase);
  const tokenService = new TokenService(supabase);

  const userData = await userRepo.findUserWithRelations(identifier);

  if (!userData?.id) {
    throw new Error("User not found");
  }

  const userProfile = await profileRepo.findParticipantProfile(userData.id);
  const tokenBalance = await tokenService.getBalance(userData.id);

  return {
    ...userData,
    profile: {
      ...userProfile,
      token_balance: tokenBalance,
    },
  };
};

interface UpdateRolesInterface {
  ids: number[];
  primaryRoleId: number;
}

export const updateParticipantProfileService = async (userId: string, body: any) => {
  const supabase = await createClient();

  const userRepo = new UsersRepository(supabase);
  const profileRepo = new UserProfileRepository(supabase);
  const participantRolesRepo = new ParticipantRolesRepository(supabase);

  const { full_name, display_wallet_id, ...participantOnlyFields } = body;

  const participantData: Partial<ParticipantProfile> & {
    roles?: UpdateRolesInterface;
  } = validateUpdateParticipantProfileBody(participantOnlyFields);

  // update user fields if provided
  if (full_name !== undefined) {
    await userRepo.updateUserFields(userId, { full_name, display_wallet_id });
  }

  if (participantData.roles && Object.keys(participantData.roles).length > 0) {
    const roles = participantData.roles;

    const roleIds = roles.ids?.filter((id: number): id is number => id !== undefined) ?? [];
    const primaryRoleId = roles.primaryRoleId ?? undefined;
    await participantRolesRepo.update_roles_for_participant(userId, roleIds, primaryRoleId);
  }

  delete participantData?.roles;

  // update participant profile
  const updatedProfile = await profileRepo.updateParticipantProfile(userId, participantData);

  return updatedProfile;
};
