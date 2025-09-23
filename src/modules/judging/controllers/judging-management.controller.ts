import { createClient } from "@/lib/supabase";
import VipInvitationService from "@/modules/hackathon/services/hackathonVips";
import { buildResponse } from "@/utils/buildResponse";
import {
  addJudgeToProjectsService,
  assignProjectsService,
  assignWinnerAssignerService,
  assignWinnersForChallengesService,
  createJudgingService,
  getAssignWinnerButtonStatusService,
  getChallengeJudgesForWinnerAssignmentService,
  getChallengeProjectsForWinnerAssignmentService,
  getJudgeProjectSubmissionStatus,
  getJudgingChallengesService,
  getJudgingProgressService,
  getProjectsAJudgeIsJudgingService,
  getWinnerAssignerChallengesService,
  removeJudgeFromProjectsService,
  submitJudgingService,
} from "../services";
import {
  validateAssignProjectsBody,
  validateAssignWinnersForChallengesPayload,
  validateCreateJudgingBody,
  validateGetJudgingChallengesParams,
  validateGetJudgingProgressParams,
  validateJudgeWithProjectsBody,
  validateSubmitJudgingParams,
  vipArrayCustomValidation,
  vipArraySchema,
} from "../validators";

export const createJudgingController = async (body: any) => {
  try {
    const validatedBody = validateCreateJudgingBody(body);
    const result = await createJudgingService(validatedBody);

    return buildResponse({
      message: "Judging created successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to create judging",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const assignProjectsController = async (body: any) => {
  try {
    const validatedBody = validateAssignProjectsBody(body);
    const result = await assignProjectsService(validatedBody);

    return buildResponse({
      message: "Projects assigned successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to assign projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const submitJudgingController = async (params: any) => {
  try {
    const validatedParams = validateSubmitJudgingParams({
      judging_id: params.judgingId,
    });
    const result = await submitJudgingService(validatedParams);

    return buildResponse({
      message: "Judging submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit judging",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getJudgingProgressController = async (params: any) => {
  try {
    const validatedParams = validateGetJudgingProgressParams({
      judging_id: params.judgingId,
    });
    const result = await getJudgingProgressService(validatedParams);

    return buildResponse({
      message: "Judging progress retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get judging progress",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getJudgingChallengesController = async (params: any) => {
  try {
    const validatedParams = validateGetJudgingChallengesParams({
      judging_id: params.judgingId,
    });
    const result = await getJudgingChallengesService(validatedParams);

    return buildResponse({
      message: "Judging challenges retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get judging challenges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getProjectsAJudgeIsJudgingController = async (judging_id: number) => {
  try {
    const result = await getProjectsAJudgeIsJudgingService(judging_id);

    return buildResponse({
      message: "Projects fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to fetch projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const addJudgeToProjectsController = async (body: any, params: { judgingId: string }) => {
  try {
    const judging_id = parseInt(params.judgingId);
    if (isNaN(judging_id) || judging_id <= 0) {
      throw new Error("Invalid Judging Id");
    }

    validateJudgeWithProjectsBody(body);

    const result = await addJudgeToProjectsService(judging_id, body.project_challenge_pairs);

    return buildResponse({
      message: "Judge added to projects successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to add judge to projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const removeJudgeFromProjectsController = async (
  body: any,
  params: { judgingId: string }
) => {
  try {
    const judging_id = parseInt(params.judgingId);
    if (isNaN(judging_id) || judging_id <= 0) {
      throw new Error("Invalid Judging Id");
    }

    validateJudgeWithProjectsBody(body);

    const result = await removeJudgeFromProjectsService(judging_id, body.project_challenge_pairs);

    return buildResponse({
      message: "Judge removed from projects successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to remove judge from projects",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const addJudgesTOHackathonController = async (hackathon_id: number, body: any) => {
  try {
    const supabase = await createClient();

    const vipInvitationService = new VipInvitationService(supabase);
    const validationErrors = vipArrayCustomValidation(body);

    if (validationErrors.length > 0) {
      return buildResponse({
        message: `Validation failed: ${validationErrors.join("; ")}`,
        data: `Validation failed: ${validationErrors.join("; ")}`,
        isError: true,
        status: 400,
      });
    }
    const validatedBody = await vipArraySchema.validate(body, {
      abortEarly: false,
    });

    const data = await vipInvitationService.inviteVips(hackathon_id, validatedBody);

    return buildResponse({
      message: "Hackathon Judge invited successfully",
      data,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to add hackathon judges",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const getJudgeProjectSubmissionStatusController = async (
  judgingId: number,
  challengeId: number
) => {
  try {
    const result = await getJudgeProjectSubmissionStatus(judgingId, challengeId);

    return buildResponse({
      message: "Fetched judge project submission status successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch judge project submission status",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getChallengeJudgesForWinnerAssignmentController = async (
  judgingId: number,
  challengeId: number
) => {
  try {
    const result = await getChallengeJudgesForWinnerAssignmentService(judgingId, challengeId);

    return buildResponse({
      message: "Fetched challenge judges for winner assignment successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch challenge judges for winner assignment",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getChallengeProjectsForWinnerAssignmentController = async (
  judgingId: number,
  challengeId: number
) => {
  try {
    const result = await getChallengeProjectsForWinnerAssignmentService(judgingId, challengeId);

    return buildResponse({
      message: "Fetched challenge projects for winner assignment successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch challenge projects for winner assignment",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getAssignWinnerButtonStatusController = async (judgingId: number) => {
  try {
    const result = await getAssignWinnerButtonStatusService(judgingId);

    return buildResponse({
      message: "Fetched assign winner button status successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch assign winner button status",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getWinnerAssignerChallengesController = async (judgingId: number) => {
  try {
    const result = await getWinnerAssignerChallengesService(judgingId);

    return buildResponse({
      message: "Fetched winner assigner challenges successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch winner assigner challenges",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const assignWinnersForChallengesController = async (
  body: any,
  params: { judgingId: string }
) => {
  try {
    const judging_id = parseInt(params.judgingId);
    if (isNaN(judging_id) || judging_id <= 0) {
      throw new Error("Invalid Judging Id");
    }

    validateAssignWinnersForChallengesPayload(body);

    const result = await assignWinnersForChallengesService(judging_id, body.winners);

    return buildResponse({
      message: "Winners assigned successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to assign winners",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const assignWinnerAssignerController = async (
  challenge_id: number,
  judging_id: number,
  is_winner_assigner: boolean
) => {
  try {
    const result = await assignWinnerAssignerService(challenge_id, judging_id, is_winner_assigner);

    return buildResponse({
      message: "Winner assigner updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to assign winner assigner",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
