import * as Yup from "yup";

export const hackathonResourcesParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonResourceParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
  resource_id: Yup.number().required("Resource ID is required").positive("Resource ID must be positive"),
});

export const validateHackathonResourcesParams = (params: any) => {
  return hackathonResourcesParamsSchema.validateSync(params);
};

export const validateHackathonResourceParams = (params: any) => {
  return hackathonResourceParamsSchema.validateSync(params);
};