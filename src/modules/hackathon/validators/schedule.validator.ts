import * as Yup from "yup";

export const hackathonScheduleParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonSessionRsvpParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
  session_id: Yup.number().required("Session ID is required").positive("Session ID must be positive"),
});

export const hackathonSessionRsvpBodySchema = Yup.object({
  attending: Yup.boolean().required("Attending status is required"),
});

export const hackathonUpcomingSessionParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const validateHackathonScheduleParams = (params: any) => {
  return hackathonScheduleParamsSchema.validateSync(params);
};

export const validateHackathonSessionRsvpParams = (params: any) => {
  return hackathonSessionRsvpParamsSchema.validateSync(params);
};

export const validateHackathonSessionRsvpBody = (body: any) => {
  return hackathonSessionRsvpBodySchema.validateSync(body);
};

export const validateHackathonUpcomingSessionParams = (params: any) => {
  return hackathonUpcomingSessionParamsSchema.validateSync(params);
};