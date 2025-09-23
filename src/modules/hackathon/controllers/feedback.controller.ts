import { buildResponse } from "@/utils/buildResponse";
import {
  createFeedbackForChallenge,
  createHackathonFeedbackService,
  getFeedbackByChallengeService,
  updateFeedbackForChallenge,
} from "../services/feedback.service";
import {
  validateGlobalHackathonFeedbackParams,
  validateHackathonFeedbackBody,
  validateHackathonFeedbackParams,
  validateUpdateHackathonFeedbackBody,
} from "../validators/feedback.validator";

export const createGlobalHackathonFeedbackController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonFeedbackParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateGlobalHackathonFeedbackParams({
      hackathon_id: parseInt(params.hackathonId),
      ...body,
    });
    const result = await createHackathonFeedbackService(validatedParams, validatedBody);

    return buildResponse({
      message: "Hackathon feedback submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit hackathon feedback",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getFeedbackByChallengeController = async (params: any) => {
  try {
    const validatedParams = validateHackathonFeedbackParams({
      hackathon_id: parseInt(params.hackathonId),
      challenge_id: parseInt(params.challengeId),
    });

    const result = await getFeedbackByChallengeService(
      validatedParams.hackathon_id,
      validatedParams.challenge_id
    );

    return buildResponse({
      message: "Feedback fetched successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to fetch feedback",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const submitHackathonFeedbackController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonFeedbackParams({
      hackathon_id: parseInt(params.hackathonId),
      challenge_id: parseInt(params.challengeId),
    });
    const validatedBody = validateHackathonFeedbackBody(body);

    const result = await createFeedbackForChallenge({
      ...validatedParams,
      ...validatedBody,
    });

    return buildResponse({
      message: "Hackathon feedback submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit hackathon feedback",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateHackathonFeedbackController = async (params: any, body: any) => {
  try {
    const validatedParams = validateHackathonFeedbackParams({
      hackathon_id: parseInt(params.hackathonId),
      challenge_id: parseInt(params.challengeId),
    });
    const validatedBody = validateUpdateHackathonFeedbackBody(body);

    const result = await updateFeedbackForChallenge({
      ...validatedParams,
      ...validatedBody,
    });

    return buildResponse({
      message: "Hackathon feedback updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update hackathon feedback",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
