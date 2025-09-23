import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ApplicationsRepository } from "../repositories/applications.repository";
import {
  AnswerQuestionnaireParams,
  AnswerQuestionnaireRequest,
  AnswerQuestionnaireResponse,
  ApplyAdditionalQuestionsParams,
  ApplyAdditionalQuestionsResponse,
} from "../types";

export const getAdditionalQuestionsService = async (
  params: ApplyAdditionalQuestionsParams
): Promise<ApplyAdditionalQuestionsResponse> => {
  const supabase = await createClient();
  const applicationsRepository = new ApplicationsRepository(supabase);

  const questions = await applicationsRepository.getAdditionalQuestions(params.hackathon_id);

  return {
    questions,
  };
};

export const answerQuestionnaireService = async (
  params: AnswerQuestionnaireParams,
  body: AnswerQuestionnaireRequest
): Promise<AnswerQuestionnaireResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const applicationsRepository = new ApplicationsRepository(supabase);
  const answers = await applicationsRepository.submitQuestionnaireAnswers(
    params.hackathon_id,
    user.id,
    body.answers
  );

  return {
    id: answers[0]?.id || 0,
    answers,
  };
};
