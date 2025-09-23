import * as Yup from "yup";

export const participantTeamUpParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
  participant_id: Yup.string().required("Participant ID is required"),
});

export const participantTeamUpBodySchema = Yup.object({
  action: Yup.string().oneOf(["invite", "accept", "decline"], "Action must be invite, accept, or decline").required("Action is required"),
  message: Yup.string().optional(),
});

export const hackathonParticipantsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonParticipantsQuerySchema = Yup.object({
  page: Yup.number().min(1).optional(),
  limit: Yup.number().min(1).max(100).optional(),
  search: Yup.string().optional(),
});

export const validateParticipantTeamUpParams = (params: any) => {
  return participantTeamUpParamsSchema.validateSync(params);
};

export const validateParticipantTeamUpBody = (body: any) => {
  return participantTeamUpBodySchema.validateSync(body);
};

export const validateHackathonParticipantsParams = (params: any) => {
  return hackathonParticipantsParamsSchema.validateSync(params);
};

export const validateHackathonParticipantsQuery = (query: any) => {
  return hackathonParticipantsQuerySchema.validateSync(query);
};