import { buildResponse } from "@/utils/buildResponse";
import {
  answerQuestionnaireService,
  getAdditionalQuestionsService,
} from "../services/applications.service";
import {
  validateAnswerQuestionnaireBody,
  validateAnswerQuestionnaireParams,
  validateApplyAdditionalQuestionsParams,
} from "../validators/applications.validator";

export const getAdditionalQuestionsController = async (params: any) => {
  try {
    const validatedParams = validateApplyAdditionalQuestionsParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const result = await getAdditionalQuestionsService(validatedParams);

    return buildResponse({
      message: "Additional questions retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to retrieve additional questions",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const answerQuestionnaireController = async (params: any, body: any) => {
  try {
    const validatedParams = validateAnswerQuestionnaireParams({
      hackathon_id: parseInt(params.hackathonId),
    });
    const validatedBody = validateAnswerQuestionnaireBody(body);
    const result = await answerQuestionnaireService(validatedParams, validatedBody);

    return buildResponse({
      message: "Questionnaire answers submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit questionnaire answers",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
