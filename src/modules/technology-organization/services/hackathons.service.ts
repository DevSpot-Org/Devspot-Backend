import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { HackathonsRepository } from "@/modules/hackathon/repositories/hackathons.repository";
import { ApplicationAndStakingPayload } from "@/modules/projects/types";
import AnalyticsService, { Granularity } from "./analytics.service";

export const getHackathonAttritionAnalyticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  // Throw an error instead of returning a response object
  if (authError) {
    throw new Error("Authentication failed: ");
  }

  const analyticsService = new AnalyticsService(supabase);

  // The service now directly returns the data or lets errors propagate
  const analyticsData = await analyticsService.get_hackathon_attrition_analytics(hackathonId);

  return analyticsData;
};

export const getHackathonCommonSkillsAnalyticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  if (authError) {
    throw new Error("User is not authenticated.");
  }

  const analyticsService = new AnalyticsService(supabase);

  const skills = await analyticsService.get_hackathon_common_skills_analytics(hackathonId);

  return skills;
};

export const getHackathonFaqAnalyticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  if (authError) {
    throw new Error("Authentication is required for this action.");
  }

  const analyticsService = new AnalyticsService(supabase);

  const faqs = await analyticsService.get_hackathon_faq_analytics(hackathonId);

  return faqs;
};

export const getHackathonAnalyticsOverviewService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  // If authentication fails, throw an error to be caught by the controller
  if (authError) {
    throw new Error("Authentication is required to view analytics.");
  }

  const analyticsService = new AnalyticsService(supabase);

  // Directly return the data from the database call or let errors propagate
  const overview = await analyticsService.get_hackathon_analytics_overview(hackathonId);

  return overview;
};

export const getHackathonRegistrationAnalyticsService = async (
  hackathonId: number,
  granularity: Granularity
) => {
  const supabase = await createClient();
  const analyticsService = new AnalyticsService(supabase);

  // The service's only job is to call the data layer and return the data
  const data = await analyticsService.get_hackathon_registration_analytics(
    hackathonId,
    granularity
  );

  return data;
};

export const getHackathonResourcesAnalyticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  // If authentication fails, throw an error to be caught by the controller
  if (authError) {
    throw new Error("Authentication is required to view resource analytics.");
  }

  const analyticsService = new AnalyticsService(supabase);

  // Directly return the data from the database call or let errors propagate
  const resources = await analyticsService.get_hackathon_resources_analytics(hackathonId);

  return resources;
};

export const getHackathonSessionsAnalyticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  // If authentication fails, throw an error to be caught by the controller
  if (authError) {
    throw new Error("Authentication is required to view session analytics.");
  }

  const analyticsService = new AnalyticsService(supabase);

  // Directly return the data from the database call or let errors propagate
  const sessions = await analyticsService.get_hackathon_sessions_analytics(hackathonId);

  return sessions;
};

export const getHackathonRegistrationsService = async (
  hackathonId: number,
  validatedOptions: any
) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  // If authentication fails, throw an error
  if (authError) {
    throw new Error("Authentication is required for this action.");
  }

  const analyticsService = new AnalyticsService(supabase);

  // Directly call the data access method with validated options
  const data = await analyticsService.get_hackathon_participants_TO(hackathonId, validatedOptions);

  return data;
};

export const getHackathonJudgingStatisticsService = async (hackathonId: number) => {
  const supabase = await createClient();
  const judgingService = new JudgingService(supabase);

  const data = await judgingService.getHackathonJudgingStatistics(hackathonId);

  return data;
};

export const getHackathonFeedbackOverviewService = async (hackathonId: number) => {
  const supabase = await createClient();
  const technologyOwnerService = new TechnologyOwnerService(supabase);

  const data = await technologyOwnerService.get_hackathon_feedback_overview(hackathonId);

  return data;
};

export const assignChallengesToProjectsService = async (
  hackathonId: number,
  projectIds: number[],
  challengeIds: number[]
) => {
  const supabase = await createClient();
  const technologyOwnerService = new TechnologyOwnerService(supabase);

  const data = await technologyOwnerService.assignChallengesToProjects(
    hackathonId,
    projectIds,
    challengeIds
  );

  return data;
};

export const editHackathonDescriptionService = async (
  technologyOwnerId: number,
  hackathonId: number,
  description: string
) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  if (authError) {
    throw new Error("Authentication failed.");
  }

  const hackathonRepository = new HackathonsRepository(supabase);

  // 1. Check for authorization using the repository
  const isAuthorized = await hackathonRepository.isOrganizer(hackathonId, technologyOwnerId);

  if (!isAuthorized) {
    throw new Error("Unauthorized: You are not the organizer of this hackathon.");
  }

  const sanitizedContent = HtmlSanitizer.sanitize(description);

  const updatedHackathon = await hackathonRepository.updateDescription(
    hackathonId,
    sanitizedContent
  );

  return updatedHackathon;
};

export const editHackathonApplicationAndStakingService = async (
  technologyOwnerId: number,
  hackathonId: number,
  payload: ApplicationAndStakingPayload
) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();

  if (authError) {
    throw new Error("Authentication failed.");
  }

  const hackathonRepository = new HackathonsRepository(supabase);

  const isAuthorized = await hackathonRepository.isOrganizer(hackathonId, technologyOwnerId);

  if (!isAuthorized) {
    throw new Error("Unauthorized: You are not the organizer of this hackathon.");
  }

  const result = await hackathonRepository.updateApplicationAndStaking(hackathonId, payload);

  return result;
};

export const getHackathonCompletionPercentageService = async (
  technologyOwnerId: number,
  hackathonId: number
) => {
  const supabase = await createClient();

  const { error: authError } = await getAuthenticatedUser();
  if (authError) throw new Error("Authentication failed.");

  const hackathonRepository = new HackathonsRepository(supabase);

  const isAuthorized = await hackathonRepository.isOrganizer(hackathonId, technologyOwnerId);
  if (!isAuthorized) {
    throw new Error("Unauthorized: You are not the organizer of this hackathon.");
  }

  const hackathon = await hackathonRepository.getWithCompletionData(hackathonId);

  let completionPercentage = 0;

  if (hackathon?.vips?.[0]?.count >= 1) completionPercentage += 20;
  if (hackathon?.resources?.[0]?.count >= 1) completionPercentage += 15;
  if (hackathon?.faqs?.[0]?.count >= 1) completionPercentage += 15;
  if (hackathon?.description && hackathon.description.trim().length > 0) completionPercentage += 20;
  if (hackathon?.sessions?.[0]?.count >= 1) completionPercentage += 10;
  if (hackathon?.registration_start_date && hackathon?.deadline_to_join) completionPercentage += 20;

  return {
    completionPercentage,
    details: {
      hasVips: hackathon?.vips?.[0]?.count >= 1,
      hasResources: hackathon?.resources?.[0]?.count >= 1,
      hasFaqs: hackathon?.faqs?.[0]?.count >= 1,
      hasDescription: !!hackathon?.description?.trim(),
      hasSessions: hackathon?.sessions?.[0]?.count >= 1,
      hasRegistrationDates: !!(hackathon?.registration_start_date && hackathon?.deadline_to_join),
    },
  };
};

export const editHackathonDetailsService = async (
  technologyOwnerId: number,
  hackathonId: number,
  validatedBody: any
) => {
  const supabase = await createClient();
  const { error: authError } = await getAuthenticatedUser();
  if (authError) throw new Error("Authentication failed.");

  const hackathonRepository = new HackathonsRepository(supabase);

  // 1. Authorize the user
  const isAuthorized = await hackathonRepository.isOrganizer(hackathonId, technologyOwnerId);
  if (!isAuthorized) {
    throw new Error("Unauthorized: You are not the organizer of this hackathon.");
  }

  const dbPayload = {
    type: validatedBody.type,
    start_date: validatedBody.hackathon_start_date_time,
    end_date: validatedBody.hackathon_end_date_time,
    registration_start_date: validatedBody.registration_start_date_time,
    deadline_to_join: validatedBody.registration_end_date_time,
    submission_start_date: validatedBody.project_submission_start_date_time,
    deadline_to_submit: validatedBody.project_submission_end_date_time,
    rules: validatedBody.rules,
    communication_link: validatedBody.communication_link,
    winners_announcement_date: validatedBody.winners_announcement_date?.trim() || null,
    project_submission_deadline_countdown_trigger:
      validatedBody.show_project_submission_deadline_countdown ?? false,
    project_submission_opens_countdown_trigger:
      validatedBody.show_project_submission_opens_countdown ?? false,
  };

  const result = await hackathonRepository.updateDetails(hackathonId, dbPayload);

  return result;
};
