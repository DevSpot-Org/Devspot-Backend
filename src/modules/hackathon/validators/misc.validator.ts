import * as Yup from "yup";

export const hackathonOverviewParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonJoinParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonJoinBodySchema = Yup.object({
  email: Yup.string().email("Invalid email format").optional(),
});

export const hackathonJoinStakeParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonJoinStakeBodySchema = Yup.object({
  amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
});

export const hackathonJudgesSearchParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonJudgesSearchQuerySchema = Yup.object({
  query: Yup.string().required("Search query is required"),
});

export const hackathonLeaderboardParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonLeaveParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonSponsorsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonStakeParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonStakeBodySchema = Yup.object({
  amount: Yup.number().required("Amount is required").positive("Amount must be positive"),
});

export const hackathonToggleJudgeParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonToggleJudgeBodySchema = Yup.object({
  is_judge: Yup.boolean().required("Judge status is required"),
});

export const hackathonToggleMultiProjectsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonToggleMultiProjectsBodySchema = Yup.object({
  allow_multiple_projects: Yup.boolean().required("Multiple projects status is required"),
});

export const hackathonVipsParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonHandleInvitationParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const hackathonHandleInvitationBodySchema = Yup.object({
  action: Yup.string().oneOf(["accept", "decline"], "Action must be accept or decline").required("Action is required"),
  invitation_id: Yup.number().required("Invitation ID is required").positive("Invitation ID must be positive"),
});

export const hackathonParamsSchema = Yup.object({
  hackathon_id: Yup.number().required("Hackathon ID is required").positive("Hackathon ID must be positive"),
});

export const validateHackathonOverviewParams = (params: any) => {
  return hackathonOverviewParamsSchema.validateSync(params);
};

export const validateHackathonJoinParams = (params: any) => {
  return hackathonJoinParamsSchema.validateSync(params);
};

export const validateHackathonJoinBody = (body: any) => {
  return hackathonJoinBodySchema.validateSync(body);
};

export const validateHackathonJoinStakeParams = (params: any) => {
  return hackathonJoinStakeParamsSchema.validateSync(params);
};

export const validateHackathonJoinStakeBody = (body: any) => {
  return hackathonJoinStakeBodySchema.validateSync(body);
};

export const validateHackathonJudgesSearchParams = (params: any) => {
  return hackathonJudgesSearchParamsSchema.validateSync(params);
};

export const validateHackathonJudgesSearchQuery = (query: any) => {
  return hackathonJudgesSearchQuerySchema.validateSync(query);
};

export const validateHackathonLeaderboardParams = (params: any) => {
  return hackathonLeaderboardParamsSchema.validateSync(params);
};

export const validateHackathonLeaveParams = (params: any) => {
  return hackathonLeaveParamsSchema.validateSync(params);
};

export const validateHackathonSponsorsParams = (params: any) => {
  return hackathonSponsorsParamsSchema.validateSync(params);
};

export const validateHackathonStakeParams = (params: any) => {
  return hackathonStakeParamsSchema.validateSync(params);
};

export const validateHackathonStakeBody = (body: any) => {
  return hackathonStakeBodySchema.validateSync(body);
};

export const validateHackathonToggleJudgeParams = (params: any) => {
  return hackathonToggleJudgeParamsSchema.validateSync(params);
};

export const validateHackathonToggleJudgeBody = (body: any) => {
  return hackathonToggleJudgeBodySchema.validateSync(body);
};

export const validateHackathonToggleMultiProjectsParams = (params: any) => {
  return hackathonToggleMultiProjectsParamsSchema.validateSync(params);
};

export const validateHackathonToggleMultiProjectsBody = (body: any) => {
  return hackathonToggleMultiProjectsBodySchema.validateSync(body);
};

export const validateHackathonVipsParams = (params: any) => {
  return hackathonVipsParamsSchema.validateSync(params);
};

export const validateHackathonHandleInvitationParams = (params: any) => {
  return hackathonHandleInvitationParamsSchema.validateSync(params);
};

export const validateHackathonHandleInvitationBody = (body: any) => {
  return hackathonHandleInvitationBodySchema.validateSync(body);
};

export const validateHackathonParams = (params: any) => {
  return hackathonParamsSchema.validateSync(params);
};