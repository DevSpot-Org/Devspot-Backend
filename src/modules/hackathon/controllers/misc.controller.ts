import { buildResponse } from "@/utils/buildResponse";
import {
  createStakeService,
  getHackathonOverviewService,
  getHackathonService,
  getLeaderboardService,
  getSponsorsService,
  getUsedTechnologiesInHackathonService,
  getVipsService,
  handleInvitationService,
  joinHackathonService,
  leaveHackathonService,
  searchJudgesService,
  toggleJudgeService,
  toggleMultiProjectsService,
} from "../services/misc.service";
import {
  validateHackathonHandleInvitationBody,
  validateHackathonHandleInvitationParams,
  validateHackathonJoinBody,
  validateHackathonJoinParams,
  validateHackathonJudgesSearchParams,
  validateHackathonJudgesSearchQuery,
  validateHackathonLeaderboardParams,
  validateHackathonLeaveParams,
  validateHackathonOverviewParams,
  validateHackathonParams,
  validateHackathonSponsorsParams,
  validateHackathonStakeBody,
  validateHackathonStakeParams,
  validateHackathonToggleJudgeBody,
  validateHackathonToggleJudgeParams,
  validateHackathonToggleMultiProjectsBody,
  validateHackathonToggleMultiProjectsParams,
  validateHackathonVipsParams,
} from "../validators/misc.validator";

export const getHackathonOverviewController = async (params: any) => {
  try {
    const validatedParams = validateHackathonOverviewParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonOverviewService(validatedParams);

    return buildResponse({
      message: "Hackathon overview retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon overview",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const joinHackathonController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonJoinParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonJoinBody(body);
    const result = await joinHackathonService(validatedParams, validatedBody);

    return buildResponse({
      message: "Joined hackathon successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to join hackathon",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const leaveHackathonController = async (params: any) => {
  try {
    const validatedParams = validateHackathonLeaveParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await leaveHackathonService(validatedParams);

    return buildResponse({
      message: result.message,
      data: null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to leave hackathon",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const searchJudgesController = async (params: any, query: any) => {
  try {
    const validatedParams = validateHackathonJudgesSearchParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedQuery = validateHackathonJudgesSearchQuery(query);
    const result = await searchJudgesService(validatedParams, validatedQuery);

    return buildResponse({
      message: "Judges search completed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to search judges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getLeaderboardController = async (params: any) => {
  try {
    const validatedParams = validateHackathonLeaderboardParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getLeaderboardService(validatedParams);

    return buildResponse({
      message: "Leaderboard retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve leaderboard",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getSponsorsController = async (params: any) => {
  try {
    const validatedParams = validateHackathonSponsorsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getSponsorsService(validatedParams);

    return buildResponse({
      message: "Sponsors retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve sponsors",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const createStakeController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonStakeParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonStakeBody(body);
    const result = await createStakeService(validatedParams, validatedBody);

    return buildResponse({
      message: "Stake transaction created successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to create stake transaction",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const toggleJudgeController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonToggleJudgeParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonToggleJudgeBody(body);
    const result = await toggleJudgeService(validatedParams, validatedBody);

    return buildResponse({
      message: "Judge status toggled successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to toggle judge status",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const toggleMultiProjectsController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonToggleMultiProjectsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonToggleMultiProjectsBody(body);
    const result = await toggleMultiProjectsService(validatedParams, validatedBody);

    return buildResponse({
      message: "Multiple projects setting toggled successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to toggle multiple projects setting",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getVipsController = async (params: any) => {
  try {
    const validatedParams = validateHackathonVipsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getVipsService(validatedParams);

    return buildResponse({
      message: "VIPs retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve VIPs",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const handleInvitationController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonHandleInvitationParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateHackathonHandleInvitationBody(body);
    const result = await handleInvitationService(validatedParams, validatedBody);

    return buildResponse({
      message: result.message,
      data: null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to handle invitation",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonController = async (params: any) => {
  try {
    const validatedParams = validateHackathonParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getHackathonService(validatedParams);

    return buildResponse({
      message: "Hackathon retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getUsedTechnologiesInHackathonController = async (hackathonId: number) => {
  try {
    const result = await getUsedTechnologiesInHackathonService(hackathonId);

    return buildResponse({
      message: "Technologies retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch technologies from challenges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
