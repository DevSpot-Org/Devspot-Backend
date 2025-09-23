import {
  GetHackathonJudgesSearchParams,
  GetJudgingPrizesParams,
  GetJudgingProjectsParams,
  GetJudgingProjectsUngroupedParams,
  GetUserJudgingsParams,
} from "../types";

export const validateGetUserJudgingsParams = (params: any): GetUserJudgingsParams => {
  if (!params.user_id || typeof params.user_id !== "string") {
    throw new Error("user_id is required and must be a string");
  }

  return {
    user_id: params.user_id,
  };
};

export const validateGetUserJudgingProjectsParams = (params: any): GetJudgingProjectsParams => {
  if (!params.user_id || typeof params.user_id !== "string") {
    throw new Error("Invalid user_id parameter");
  }
  if (!params.judging_id || isNaN(parseInt(params.judging_id))) {
    throw new Error("Invalid judging_id parameter");
  }
  return {
    user_id: params.user_id,
    judging_id: parseInt(params.judging_id),
  };
};

export const validateGetUserJudgingProjectsUngroupedParams = (
  params: any
): GetJudgingProjectsUngroupedParams => {
  if (!params.user_id || typeof params.user_id !== "string") {
    throw new Error("Invalid user_id parameter");
  }
  if (!params.judging_id || isNaN(parseInt(params.judging_id))) {
    throw new Error("Invalid judging_id parameter");
  }
  return {
    user_id: params.user_id,
    judging_id: parseInt(params.judging_id),
  };
};

export const validateGetUserJudgingPrizesParams = (params: any): GetJudgingPrizesParams => {
  if (!params.user_id || typeof params.user_id !== "string") {
    throw new Error("Invalid user_id parameter");
  }
  if (!params.judging_id || typeof params.judging_id !== "number") {
    throw new Error("Invalid judging_id parameter");
  }

  return {
    user_id: params.user_id,
    judging_id: params.judging_id,
  };
};

export const validateGetHackathonJudgesSearchParams = (
  params: any
): GetHackathonJudgesSearchParams => {
  if (!params.hackathon_id || typeof params.hackathon_id !== "number") {
    throw new Error("Invalid hackathon_id parameter");
  }

  return {
    hackathon_id: params.hackathon_id,
  };
};
