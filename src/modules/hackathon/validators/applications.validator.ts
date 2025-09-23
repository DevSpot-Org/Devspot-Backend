import * as Yup from "yup";

export const applyAdditionalQuestionsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const answerQuestionnaireParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const answerQuestionnaireBodySchema = Yup.object({
  answers: Yup.array().of(
    Yup.object({
      question_id: Yup.number().required("Question ID is required").positive("Question ID must be positive"),
      answer: Yup.string().required("Answer is required"),
    })
  ).required("Answers are required").min(1, "At least one answer is required"),
});

export const validateApplyAdditionalQuestionsParams = (params: any) => {
  return applyAdditionalQuestionsParamsSchema.validateSync(params);
};

export const validateAnswerQuestionnaireParams = (params: any) => {
  return answerQuestionnaireParamsSchema.validateSync(params);
};

export const validateAnswerQuestionnaireBody = (body: any) => {
  return answerQuestionnaireBodySchema.validateSync(body);
};