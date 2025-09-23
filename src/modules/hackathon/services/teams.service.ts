import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { TeamsRepository } from "../repositories/teams.repository";
import {
  HackathonAvailableTeammatesParams,
  HackathonAvailableTeammatesResponse,
  HackathonLookingForTeamParams,
  HackathonLookingForTeamRequest,
  HackathonLookingForTeamResponse,
} from "../types";

export const getAvailableTeammatesService = async (
  params: HackathonAvailableTeammatesParams
): Promise<HackathonAvailableTeammatesResponse> => {
  const supabase = await createClient();
  const teamsRepository = new TeamsRepository(supabase);

  const teammates = await teamsRepository.getAvailableTeammates(params.hackathon_id);

  return {
    teammates,
  };
};

export const updateLookingForTeamService = async (
  params: HackathonLookingForTeamParams,
  body: HackathonLookingForTeamRequest
): Promise<HackathonLookingForTeamResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const teamsRepository = new TeamsRepository(supabase);
  const result = await teamsRepository.updateLookingForTeamStatus(
    params.hackathon_id,
    user.id,
    body.looking_for_team
  );

  return {
    id: result.user_id,
    looking_for_team: result.looking_for_team,
  };
};
