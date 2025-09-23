import { createClient } from "@/lib/supabase";
import { HackathonVipInvitationsRepository } from "../repositories/vips-invitations.repository";

export const removeVipInviteService = async (
  hackathonId: number,
  identifier: string
) => {
  const supabase = await createClient();
  const repo = new HackathonVipInvitationsRepository(supabase);

  const { error } = await repo.deleteInvite(hackathonId, identifier);

  if (error) {
    throw new Error(`Failed to delete hackathon invite: ${error.message}`);
  }

  return { hackathonId, identifier };
};
