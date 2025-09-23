import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ScheduleRepository } from "../repositories/schedule.repository";
import {
  HackathonScheduleParams,
  HackathonScheduleResponse,
  HackathonSessionRsvpParams,
  HackathonSessionRsvpRequest,
  HackathonSessionRsvpResponse,
  HackathonUpcomingSessionParams,
  HackathonUpcomingSessionResponse,
} from "../types";

export const getHackathonScheduleService = async (
  params: HackathonScheduleParams
): Promise<HackathonScheduleResponse> => {
  const supabase = await createClient();
  const scheduleRepository = new ScheduleRepository(supabase);

  const sessions = await scheduleRepository.getHackathonSchedule(params.hackathon_id);

  return {
    sessions,
  };
};

export const updateSessionRsvpService = async (
  params: HackathonSessionRsvpParams,
  body: HackathonSessionRsvpRequest
): Promise<HackathonSessionRsvpResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const scheduleRepository = new ScheduleRepository(supabase);
  const result = await scheduleRepository.updateSessionRsvp(
    params.hackathon_id,
    params.session_id,
    user.id,
    body.attending
  );

  return {
    id: result.id,
    attending: result.attending,
  };
};

export const getUpcomingSessionService = async (
  params: HackathonUpcomingSessionParams
): Promise<HackathonUpcomingSessionResponse> => {
  const supabase = await createClient();
  const scheduleRepository = new ScheduleRepository(supabase);

  const session = await scheduleRepository.getUpcomingSession(params.hackathon_id);

  return {
    session,
  };
};
