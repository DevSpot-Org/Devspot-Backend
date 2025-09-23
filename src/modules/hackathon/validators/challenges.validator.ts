import * as Yup from "yup";

export const hackathonChallengesParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const searchHackathonChallengesParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const searchHackathonChallengesQuerySchema = Yup.object({
  query: Yup.string().required("Search query is required"),
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
});

export const validateHackathonChallengesParams = (params: any) => {
  return hackathonChallengesParamsSchema.validateSync(params);
};

export const validateSearchHackathonChallengesParams = (params: any) => {
  return searchHackathonChallengesParamsSchema.validateSync(params);
};

export const validateSearchHackathonChallengesQuery = (query: any) => {
  return searchHackathonChallengesQuerySchema.validateSync(query);
};