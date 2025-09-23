import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonProjectsService,
  searchHackathonProjectsService,
} from "../services/projects.service";
import {
  validateHackathonProjectsParams,
  validateHackathonProjectsQuery,
  validateSearchHackathonProjectsParams,
  validateSearchHackathonProjectsQuery,
} from "../validators/projects.validator";

export const getHackathonProjectsController = async (params: any, query: any) => {
  try {
    const validatedParams = validateHackathonProjectsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedQuery = validateHackathonProjectsQuery(query);
    const result = await getHackathonProjectsService(validatedParams, validatedQuery);

    return buildResponse({
      message: "Hackathon projects retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const searchHackathonProjectsController = async (params: any, query: any) => {
  try {
    const validatedParams = validateSearchHackathonProjectsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedQuery = validateSearchHackathonProjectsQuery(query);
    const result = await searchHackathonProjectsService(validatedParams, validatedQuery);

    return buildResponse({
      message: "Hackathon projects search completed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to search hackathon projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
