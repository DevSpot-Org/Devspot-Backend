import * as Yup from "yup";

export const hackathonCommunicationLinksParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonAnnouncementsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const validateHackathonCommunicationLinksParams = (params: any) => {
  return hackathonCommunicationLinksParamsSchema.validateSync(params);
};

export const validateHackathonAnnouncementsParams = (params: any) => {
  return hackathonAnnouncementsParamsSchema.validateSync(params);
};