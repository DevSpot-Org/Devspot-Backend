import * as Yup from "yup";

export const hackathonAvailableTeammatesParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonLookingForTeamParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonLookingForTeamBodySchema = Yup.object({
  looking_for_team: Yup.boolean().required("Looking for team status is required"),
});

export const validateHackathonAvailableTeammatesParams = (params: any) => {
  return hackathonAvailableTeammatesParamsSchema.validateSync(params);
};

export const validateHackathonLookingForTeamParams = (params: any) => {
  return hackathonLookingForTeamParamsSchema.validateSync(params);
};

export const validateHackathonLookingForTeamBody = (body: any) => {
  return hackathonLookingForTeamBodySchema.validateSync(body);
};