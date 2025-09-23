import { getAuthenticatedUser } from "@/modules/auth/utils";
import { Hackathons } from "@/types/entities";
import { HackathonsRepository } from "../repositories/hackathons.repository";
import { createClient } from "@/lib/supabase";

interface DiscoverHackathonsResponse {
  hackathons: Hackathons[];
  count: number;
}

export const discoverHackathonsService = async (): Promise<DiscoverHackathonsResponse> => {
  const supabase = await createClient();
  const hackathonRepo = new HackathonsRepository(supabase);

  const { user } = await getAuthenticatedUser();
  const now = new Date().toISOString();
  const participant_id = user?.id;

  const [hackathons, count] = await Promise.all([
    hackathonRepo.getDiscoverHackathons(now),
    hackathonRepo.getHackathonsCount(),
  ]);

  const hackathonIds = hackathons.map((h) => h.id);
  const applicationStatuses = participant_id
    ? await hackathonRepo.getParticipantStatuses(hackathonIds, participant_id)
    : {};

  const mapped = hackathons.map((hackathon: any) => ({
    ...hackathon,
    number_of_participants: hackathon?.participants?.[0]?.count ?? 0,
    application_status: applicationStatuses[hackathon.id] || null,
  }));

  return {
    hackathons: mapped,
    count,
  };
};
