import * as Yup from "yup";

export const hackathonFaqsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonFaqParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
  faq_id: Yup.number().required("FAQ ID is required").positive("FAQ ID must be positive"),
});

export const hackathonFaqBodySchema = Yup.object({
  question: Yup.string().required("Question is required").min(10, "Question must be at least 10 characters"),
  answer: Yup.string().required("Answer is required").min(10, "Answer must be at least 10 characters"),
});

export const validateHackathonFaqsParams = (params: any) => {
  return hackathonFaqsParamsSchema.validateSync(params);
};

export const validateHackathonFaqParams = (params: any) => {
  return hackathonFaqParamsSchema.validateSync(params);
};

export const validateHackathonFaqBody = (body: any) => {
  return hackathonFaqBodySchema.validateSync(body);
};