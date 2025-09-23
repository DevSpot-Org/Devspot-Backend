import * as Yup from "yup";

export const hackathonPrizesParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const validateHackathonPrizesParams = (params: any) => {
  return hackathonPrizesParamsSchema.validateSync(params);
};