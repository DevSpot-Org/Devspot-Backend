import * as Yup from "yup";

export const validateGlobalHackathonFeedbackParams = (params: any) => {
  const globalHackathonFeedbackParamsSchema = Yup.object({
    hackathon_id: Yup.number()
      .required("Hackathon ID is required")
      .positive("Hackathon ID must be positive"),

    feedback: Yup.string()
      .required("Feedback is required")
      .min(10, "Feedback must be at least 10 characters"),
    rating: Yup.number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5")
      .optional(),
  });
  return globalHackathonFeedbackParamsSchema.validateSync(params);
};

export const validateHackathonFeedbackParams = (params: any) => {
  const hackathonFeedbackParamsSchema = Yup.object({
    hackathon_id: Yup.number()
      .required("Hackathon ID is required")
      .positive("Hackathon ID must be positive"),
    challenge_id: Yup.number()
      .required("Challenge ID is required")
      .positive("Challenge ID must be positive"),
  });

  return hackathonFeedbackParamsSchema.validateSync(params, { abortEarly: false });
};

export const validateHackathonFeedbackBody = (body: any) => {
  const hackathonFeedbackBodySchema = Yup.object({
    project_id: Yup.number()
      .required("Project ID is required")
      .positive("Project ID must be positive"),
    overall_rating: Yup.number()
      .min(1, "Overall rating must be at least 1")
      .max(5, "Overall rating cannot exceed 5")
      .required("Overall rating is required"),
    docs_rating: Yup.number()
      .min(1, "Docs rating must be at least 1")
      .max(5, "Docs rating cannot exceed 5")
      .required("Docs rating is required"),
    support_rating: Yup.number()
      .min(1, "Support rating must be at least 1")
      .max(5, "Support rating cannot exceed 5")
      .required("Support rating is required"),
    comments: Yup.string().optional(),
  });

  return hackathonFeedbackBodySchema.validateSync(body, { abortEarly: false });
};

export const validateUpdateHackathonFeedbackBody = (body: any) => {
  const updateHackathonFeedbackBodySchema = Yup.object({
    project_id: Yup.number()
      .required("Project ID is required")
      .positive("Project ID must be positive"),
    overall_rating: Yup.number()
      .min(1, "Overall rating must be at least 1")
      .max(5, "Overall rating cannot exceed 5")
      .optional(),
    docs_rating: Yup.number()
      .min(1, "Docs rating must be at least 1")
      .max(5, "Docs rating cannot exceed 5")
      .optional(),
    support_rating: Yup.number()
      .min(1, "Support rating must be at least 1")
      .max(5, "Support rating cannot exceed 5")
      .optional(),
    comments: Yup.string().optional(),
  });

  return updateHackathonFeedbackBodySchema.validateSync(body, { abortEarly: false });
};
