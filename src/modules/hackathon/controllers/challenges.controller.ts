import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonChallengesService,
  searchHackathonChallengesService,
} from "../services/challenges.service";
import {
  validateHackathonChallengesParams,
  validateSearchHackathonChallengesParams,
  validateSearchHackathonChallengesQuery,
} from "../validators/challenges.validator";

export const getHackathonChallengesController = async (params: any) => {
  try {
    const validatedParams = validateHackathonChallengesParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonChallengesService(validatedParams);

    return buildResponse({
      message: "Hackathon challenges retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon challenges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const searchHackathonChallengesController = async (params: any, query: any) => {
  try {
    const validatedParams = validateSearchHackathonChallengesParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedQuery = validateSearchHackathonChallengesQuery(query);
    const result = await searchHackathonChallengesService(validatedParams, validatedQuery);

    return buildResponse({
      message: "Hackathon challenges search completed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to search hackathon challenges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
