import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonsService,
  getUserHackathonsService,
  searchHackathonsService,
} from "../services/global.service";
import {
  validateHackathonsQuery,
  validateSearchHackathonsQuery,
  validateUserHackathonsParams,
} from "../validators/global.validator";

export const searchHackathonsController = async (query: any) => {
  try {
    const validatedQuery = validateSearchHackathonsQuery(query);
    const result = await searchHackathonsService(validatedQuery);

    return buildResponse({
      message: "Hackathons search completed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to search hackathons",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonsController = async (query: any) => {
  try {
    const validatedQuery = validateHackathonsQuery(query);
    const result = await getHackathonsService(validatedQuery);

    return buildResponse({
      message: "Hackathons retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathons",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUserHackathonsController = async (params: any) => {
  try {
    const validatedParams = validateUserHackathonsParams({
      user_id: params.user_id,
    });
    const result = await getUserHackathonsService(validatedParams);

    return buildResponse({
      message: "User hackathons retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve user hackathons",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
