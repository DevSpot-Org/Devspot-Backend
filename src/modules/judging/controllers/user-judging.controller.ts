import { buildResponse } from "@/utils/buildResponse";

import {
  getHackathonJudgesSearchService,
  getUserJudgingPrizesService,
  getUserJudgingProjectsService,
  getUserJudgingProjectsUngroupedService,
  getUserJudgingsService,
} from "../services";
import {
  validateGetHackathonJudgesSearchParams,
  validateGetUserJudgingPrizesParams,
  validateGetUserJudgingProjectsParams,
  validateGetUserJudgingProjectsUngroupedParams,
  validateGetUserJudgingsParams,
} from "../validators";

export const getUserJudgingsController = async (params: any) => {
  try {
    const validatedParams = validateGetUserJudgingsParams({ user_id: params.user_id });
    const result = await getUserJudgingsService(validatedParams);

    return buildResponse({
      message: "User judgings retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get user judgings",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUserJudgingProjectsController = async (params: any) => {
  try {
    const validatedParams = validateGetUserJudgingProjectsParams({
      user_id: params.user_id,
      judging_id: params.judging_id,
    });
    const result = await getUserJudgingProjectsService(validatedParams);

    return buildResponse({
      message: "User judging projects retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get user judging projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUserJudgingProjectsUngroupedController = async (params: any) => {
  try {
    const validatedParams = validateGetUserJudgingProjectsUngroupedParams({
      user_id: params.user_id,
      judging_id: params.judging_id,
    });
    const result = await getUserJudgingProjectsUngroupedService(validatedParams);

    return buildResponse({
      message: "User judging projects ungrouped retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get user judging projects ungrouped",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUserJudgingPrizesController = async (params: any) => {
  try {
    const validatedParams = validateGetUserJudgingPrizesParams({
      user_id: params.user_id,
      judging_id: params.judging_id,
    });
    const result = await getUserJudgingPrizesService(validatedParams);

    return buildResponse({
      message: "User judging prizes retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get user judging prizes",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonJudgesSearchController = async (params: any) => {
  try {
    const validatedParams = validateGetHackathonJudgesSearchParams({
      hackathon_id: params.hackathon_id,
    });
    const result = await getHackathonJudgesSearchService(validatedParams);

    return buildResponse({
      message: "Hackathon judges retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon judges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
