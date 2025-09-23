import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ParticipantsRepository } from "../repositories/participants.repository";
import {
  HackathonParticipantsParams,
  HackathonParticipantsRequest,
  HackathonParticipantsResponse,
  ParticipantTeamUpParams,
  ParticipantTeamUpRequest,
  ParticipantTeamUpResponse,
} from "../types";

export const participantTeamUpService = async (
  params: ParticipantTeamUpParams,
  body: ParticipantTeamUpRequest
): Promise<ParticipantTeamUpResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const participantsRepository = new ParticipantsRepository(supabase);

  if (body.action === "invite") {
    const result = await participantsRepository.createTeamUpRequest(
      params.hackathon_id,
      params.participant_id,
      user.id,
      body.action,
      body.message
    );

    return {
      id: result.id,
      status: result.status,
    };
  } else {
    const result = await participantsRepository.updateTeamUpStatus(
      params.hackathon_id,
      params.participant_id,
      user.id,
      body.action === "accept" ? "confirmed" : "rejected"
    );

    return {
      id: result.id,
      status: result.status,
    };
  }
};

export const participantTeamUpStatusService = async (
  params: ParticipantTeamUpParams
): Promise<ParticipantTeamUpResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const participantsRepository = new ParticipantsRepository(supabase);
  const result = await participantsRepository.getTeamUpStatus(
    params.hackathon_id,
    params.participant_id,
    user.id
  );

  return {
    id: result?.id || 0,
    status: result?.status || "none",
  };
};

export const getHackathonParticipantsService = async (
  params: HackathonParticipantsParams,
  query: HackathonParticipantsRequest
): Promise<HackathonParticipantsResponse> => {
  const supabase = await createClient();
  const participantsRepository = new ParticipantsRepository(supabase);

  const result = await participantsRepository.getHackathonParticipants(
    params.hackathon_id,
    query.page,
    query.limit,
    query.search
  );

  return {
    participants: result.participants,
    total: result.total,
    page: query.page || 1,
    limit: query.limit || 20,
  };
};
