import * as Yup from "yup";

export const searchHackathonsQuerySchema = Yup.object({
  query: Yup.string().required("Search query is required"),
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
});

export const hackathonsQuerySchema = Yup.object({
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
  status: Yup.string().oneOf(["active", "upcoming", "past", "all"]).optional(),
});

export const userHackathonsParamsSchema = Yup.object({
  user_id: Yup.string().required("User ID is required"),
});

export const validateSearchHackathonsQuery = (query: any) => {
  return searchHackathonsQuerySchema.validateSync(query);
};

export const validateHackathonsQuery = (query: any) => {
  return hackathonsQuerySchema.validateSync(query);
};

export const validateUserHackathonsParams = (params: any) => {
  return userHackathonsParamsSchema.validateSync(params);
};