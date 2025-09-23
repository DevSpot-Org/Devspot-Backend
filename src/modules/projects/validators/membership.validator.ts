import * as yup from "yup";

export const handleInvitationSchema = yup.object().shape({
  action: yup
    .string()
    .oneOf(["accept", "decline"], "Action must be 'accept' or 'decline'")
    .required("Action is required"),
});

export const inviteParticipantSchema = yup.object({
  participant_id: yup.string().required("A Participant ID is required"),
});

export const leaveProjectSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});

export const requestToJoinSchema = yup.object().shape({
  message: yup.string().optional(),
});

export const teamSchema = yup.object().shape({
  projectId: yup.string().required("Project ID is required"),
});
