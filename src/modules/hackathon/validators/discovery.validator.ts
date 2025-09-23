import * as Yup from "yup";

export const discoverHackathonsSchema = Yup.object({
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
});

export const validateDiscoverHackathonsQuery = (query: any) => {
  return discoverHackathonsSchema.validateSync(query);
};