import * as Yup from "yup";

export const hackathonProjectsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonProjectsQuerySchema = Yup.object({
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
});

export const searchHackathonProjectsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const searchHackathonProjectsQuerySchema = Yup.object({
  query: Yup.string().required("Search query is required"),
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
});

export const validateHackathonProjectsParams = (params: any) => {
  return hackathonProjectsParamsSchema.validateSync(params);
};

export const validateHackathonProjectsQuery = (query: any) => {
  return hackathonProjectsQuerySchema.validateSync(query);
};

export const validateSearchHackathonProjectsParams = (params: any) => {
  return searchHackathonProjectsParamsSchema.validateSync(params);
};

export const validateSearchHackathonProjectsQuery = (query: any) => {
  return searchHackathonProjectsQuerySchema.validateSync(query);
};