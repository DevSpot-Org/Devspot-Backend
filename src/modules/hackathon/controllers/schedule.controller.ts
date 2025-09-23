import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonScheduleService,
  getUpcomingSessionService,
  updateSessionRsvpService,
} from "../services/schedule.service";
import {
  validateHackathonScheduleParams,
  validateHackathonSessionRsvpBody,
  validateHackathonSessionRsvpParams,
  validateHackathonUpcomingSessionParams,
} from "../validators/schedule.validator";

export const getHackathonScheduleController = async (params: any) => {
  try {
    const validatedParams = validateHackathonScheduleParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonScheduleService(validatedParams);

    return buildResponse({
      message: "Hackathon schedule retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon schedule",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateSessionRsvpController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonSessionRsvpParams({
      hackathon_id: parseInt(params.hackathonId),
      session_id: parseInt(params.sessionId),
    });
    const validatedBody = validateHackathonSessionRsvpBody(body);
    const result = await updateSessionRsvpService(validatedParams, validatedBody);

    return buildResponse({
      message: "Session RSVP updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update session RSVP",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUpcomingSessionController = async (params: any) => {
  try {
    const validatedParams = validateHackathonUpcomingSessionParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getUpcomingSessionService(validatedParams);

    return buildResponse({
      message: "Upcoming session retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve upcoming session",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
