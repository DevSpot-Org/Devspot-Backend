import { buildResponse } from "@/utils/buildResponse";
import {
  getAvailableTeammatesService,
  updateLookingForTeamService,
} from "../services/teams.service";
import {
  validateHackathonAvailableTeammatesParams,
  validateHackathonLookingForTeamBody,
  validateHackathonLookingForTeamParams,
} from "../validators/teams.validator";

export const getAvailableTeammatesController = async (params: any) => {
  try {
    const validatedParams = validateHackathonAvailableTeammatesParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getAvailableTeammatesService(validatedParams);

    return buildResponse({
      message: "Available teammates retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve available teammates",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateLookingForTeamController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonLookingForTeamParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonLookingForTeamBody(body);
    const result = await updateLookingForTeamService(validatedParams, validatedBody);

    return buildResponse({
      message: "Looking for team status updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update looking for team status",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
