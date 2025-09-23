import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonParticipantsService,
  participantTeamUpService,
  participantTeamUpStatusService,
} from "../services/participants.service";
import {
  validateHackathonParticipantsParams,
  validateHackathonParticipantsQuery,
  validateParticipantTeamUpBody,
  validateParticipantTeamUpParams,
} from "../validators/participants.validator";

export const participantTeamUpController = async (params: any, body: any) => {
  try {
    const validatedParams = validateParticipantTeamUpParams({
      hackathon_id: parseInt(params.hackathonId),
      participant_id: params.participantId,
    });
    const validatedBody = validateParticipantTeamUpBody(body);
    const result = await participantTeamUpService(validatedParams, validatedBody);

    return buildResponse({
      message: "Team-up request processed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to process team-up request",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const participantTeamUpStatusController = async (params: any) => {
  try {
    const validatedParams = validateParticipantTeamUpParams({
      hackathon_id: parseInt(params.hackathonId),
      participant_id: params.participantId,
    });
    const result = await participantTeamUpStatusService(validatedParams);

    return buildResponse({
      message: "Team-up status retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve team-up status",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonParticipantsController = async (params: any, query: any) => {
  try {
    const validatedParams = validateHackathonParticipantsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedQuery = validateHackathonParticipantsQuery(query);
    const result = await getHackathonParticipantsService(validatedParams, validatedQuery);

    return buildResponse({
      message: "Hackathon participants retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon participants",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
