import { buildResponse } from "@/utils/buildResponse";
import {
  flagProjectService,
  getProjectDetailsService,
  submitJudgingEntryService,
  updateJudgingEntryService,
} from "../services";
import {
  validateFlagProjectBody,
  validateFlagProjectParams,
  validateGetProjectDetailsParams,
  validateSubmitJudgingEntryBody,
  validateSubmitJudgingEntryParams,
  validateUpdateJudgingEntryBody,
  validateUpdateJudgingEntryParams,
} from "../validators/";

export const getProjectDetailsController = async (params: any, searchParams: any) => {
  try {
    const validatedParams = validateGetProjectDetailsParams({
      judging_id: params.judgingId,
      project_id: params.projectId,
    });
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return buildResponse({
        message: "challengeId is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await getProjectDetailsService({
      ...validatedParams,
      challenge_id: parseInt(challengeId),
    });

    return buildResponse({
      message: "Project details retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get project details",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const submitJudgingEntryController = async (params: any, body: any) => {
  try {
    const validatedParams = validateSubmitJudgingEntryParams({
      judging_id: params.judgingId,
      project_id: params.projectId,
    });
    const validatedBody = validateSubmitJudgingEntryBody(body);
    const result = await submitJudgingEntryService(validatedParams, validatedBody);

    return buildResponse({
      message: "Judging entry submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit judging entry",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateJudgingEntryController = async (params: any, body: any) => {
  try {
    const validatedParams = validateUpdateJudgingEntryParams({
      judging_id: params.judgingId,
      project_id: params.projectId,
    });
    const validatedBody = validateUpdateJudgingEntryBody(body);
    const result = await updateJudgingEntryService(validatedParams, validatedBody);

    return buildResponse({
      message: "Judging entry updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update judging entry",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const flagProjectController = async (params: any, body: any) => {
  try {
    const validatedParams = validateFlagProjectParams({
      judging_id: params.judgingId,
      project_id: params.projectId,
    });
    const validatedBody = validateFlagProjectBody(body);
    const result = await flagProjectService(
      validatedParams.judging_id,
      validatedParams.project_id,
      validatedBody
    );

    return buildResponse({
      message: "Project flagged successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to flag project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
