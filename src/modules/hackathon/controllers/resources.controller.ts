import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonResourceService,
  getHackathonResourcesService,
} from "../services/resources.service";
import {
  validateHackathonResourceParams,
  validateHackathonResourcesParams,
} from "../validators/resources.validator";

export const getHackathonResourcesController = async (params: any) => {
  try {
    const validatedParams = validateHackathonResourcesParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonResourcesService(validatedParams);

    return buildResponse({
      message: "Hackathon resources retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon resources",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonResourceController = async (params: any) => {
  try {
    const validatedParams = validateHackathonResourceParams({
      hackathon_id: parseInt(params.hackathonId),
      resource_id: parseInt(params.resourceId),
    });
    const result = await getHackathonResourceService(validatedParams);

    return buildResponse({
      message: "Hackathon resource retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon resource",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
