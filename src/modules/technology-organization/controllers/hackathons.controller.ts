// @/modules/hackathons/controllers/analytics.controller.ts

import { query_validators } from "@/lib/services/hackathons/schema";
import { Granularity } from "@/lib/services/technology_owner/services/analytics.service";
import { buildResponse } from "@/utils/buildResponse";
import {
  assignChallengesToProjectsService,
  editHackathonApplicationAndStakingService,
  editHackathonDescriptionService,
  editHackathonDetailsService,
  getHackathonAnalyticsOverviewService,
  getHackathonAttritionAnalyticsService,
  getHackathonCommonSkillsAnalyticsService,
  getHackathonCompletionPercentageService,
  getHackathonFaqAnalyticsService,
  getHackathonFeedbackOverviewService,
  getHackathonJudgingStatisticsService,
  getHackathonRegistrationAnalyticsService,
  getHackathonRegistrationsService,
  getHackathonResourcesAnalyticsService,
  getHackathonSessionsAnalyticsService,
} from "../services/hackathons.service";
import parseRequestParams from "../utils/parseRequestParams";
import {
  applicationAndStakingSchema,
  updateHackathonDetailsSchema,
} from "../validators/hackathons.validators";

export const getHackathonAttritionAnalyticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. Must be a number.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const analyticsData = await getHackathonAttritionAnalyticsService(id);

    return buildResponse({
      message: "Attrition analytics retrieved successfully",
      data: analyticsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve attrition analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonCommonSkillsAnalyticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID provided.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const skillsData = await getHackathonCommonSkillsAnalyticsService(id);

    return buildResponse({
      message: "Common skills analytics retrieved successfully",
      data: skillsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve common skills analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonFaqAnalyticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const faqAnalyticsData = await getHackathonFaqAnalyticsService(id);

    return buildResponse({
      message: "FAQ analytics retrieved successfully",
      data: faqAnalyticsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve FAQ analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonAnalyticsOverviewController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const overviewData = await getHackathonAnalyticsOverviewService(id);

    return buildResponse({
      message: "Analytics overview retrieved successfully",
      data: overviewData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve analytics overview",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonRegistrationAnalyticsController = async (
  hackathonId: string,
  granularityQuery: string | null
) => {
  try {
    // 1. Validate the hackathonId
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const granularity = (granularityQuery ?? "day") as Granularity;
    const validGranularities: Granularity[] = ["day", "week", "month", "year"];

    if (!validGranularities.includes(granularity)) {
      return buildResponse({
        message: "Invalid granularity. Must be one of: day, week, month, year.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const analyticsData = await getHackathonRegistrationAnalyticsService(id, granularity);

    return buildResponse({
      message: "Registration analytics retrieved successfully",
      data: analyticsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve registration analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonResourcesAnalyticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const resourcesData = await getHackathonResourcesAnalyticsService(id);

    return buildResponse({
      message: "Resource analytics retrieved successfully",
      data: resourcesData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve resource analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonSessionsAnalyticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const sessionsData = await getHackathonSessionsAnalyticsService(id);

    return buildResponse({
      message: "Session analytics retrieved successfully",
      data: sessionsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve session analytics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonRegistrationsController = async (
  hackathonId: string,
  searchParams: URLSearchParams
) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const paramsObject = parseRequestParams(searchParams);
    const validatedOptions = await query_validators.validate(paramsObject);

    const registrationData = await getHackathonRegistrationsService(id, validatedOptions);

    return buildResponse({
      message: "Hackathon registrations retrieved successfully",
      data: registrationData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon registrations",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonJudgingStatisticsController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const statisticsData = await getHackathonJudgingStatisticsService(id);

    return buildResponse({
      message: "Judging statistics retrieved successfully",
      data: statisticsData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve judging statistics",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const getHackathonFeedbackOverviewController = async (hackathonId: string) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const feedbackData = await getHackathonFeedbackOverviewService(id);

    return buildResponse({
      message: "Hackathon feedback overview retrieved successfully",
      data: feedbackData,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to retrieve hackathon feedback",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const assignChallengesToProjectsController = async (hackathonId: string, body: any) => {
  try {
    const id = parseInt(hackathonId);
    if (isNaN(id)) {
      return buildResponse({
        message: "Invalid Hackathon ID. A numeric ID is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const { project_ids, challenge_ids } = body;

    if (
      !Array.isArray(project_ids) ||
      project_ids.length === 0 ||
      !project_ids.every((pid) => typeof pid === "number")
    ) {
      return buildResponse({
        message: "project_ids is required and must be a non-empty array of numbers.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    if (
      !Array.isArray(challenge_ids) ||
      challenge_ids.length === 0 ||
      !challenge_ids.every((cid) => typeof cid === "number")
    ) {
      return buildResponse({
        message: "challenge_ids is required and must be a non-empty array of numbers.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const result = await assignChallengesToProjectsService(id, project_ids, challenge_ids);

    return buildResponse({
      message: "Challenges assigned to projects successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to assign challenges to projects",
      data: error,
      isError: true,
      status: 500,
    });
  }
};

export const editHackathonDescriptionController = async (
  technologyOwnerIdStr: string,
  hackathonIdStr: string,
  body: any
) => {
  try {
    const hackathonId = parseInt(hackathonIdStr);
    const technologyOwnerId = parseInt(technologyOwnerIdStr);

    if (isNaN(hackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }
    if (isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const { about } = body;
    if (!about || typeof about !== "string" || about.trim() === "") {
      return buildResponse({
        message: "A non-empty 'about' description is required.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    const result = await editHackathonDescriptionService(technologyOwnerId, hackathonId, about);

    return buildResponse({
      message: "Hackathon description updated successfully",
      data: result,
    });
  } catch (error: any) {
    // 4. Handle errors from the service layer (e.g., unauthorized)
    const isUnauthorized = error.message.toLowerCase().includes("unauthorized");
    return buildResponse({
      message: error.message,
      data: error,
      isError: true,
      status: isUnauthorized ? 403 : 500,
    });
  }
};

export const editHackathonApplicationAndStakingController = async (
  technologyOwnerIdStr: string,
  hackathonIdStr: string,
  body: any
) => {
  try {
    // 1. Validate URL parameters
    const hackathonId = parseInt(hackathonIdStr);
    const technologyOwnerId = parseInt(technologyOwnerIdStr);

    if (isNaN(hackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }
    if (isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    // 2. Validate the request body against the schema
    const validatedBody = await applicationAndStakingSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true, // It's good practice to remove unknown fields
    });

    // 3. Call the service with validated data
    const result = await editHackathonApplicationAndStakingService(
      technologyOwnerId,
      hackathonId,
      validatedBody
    );

    // 4. Build a successful response
    return buildResponse({
      message: "Application and staking details updated successfully",
      data: result,
    });
  } catch (error: any) {
    const isUnauthorized = error.message?.toLowerCase().includes("unauthorized");
    // Handle both validation errors and service errors
    return buildResponse({
      message: error.message ?? "Failed to update details",
      data: error,
      isError: true,
      status: isUnauthorized ? 403 : error.name === "ValidationError" ? 400 : 500,
    });
  }
};

export const getHackathonCompletionPercentageController = async (
  technologyOwnerIdStr: string,
  hackathonIdStr: string
) => {
  try {
    // 1. Validate URL parameters
    const technologyOwnerId = parseInt(technologyOwnerIdStr);
    const hackathonId = parseInt(hackathonIdStr);
    if (isNaN(technologyOwnerId) || isNaN(hackathonId)) {
      return buildResponse({
        message: "Invalid Owner or Hackathon ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    // 2. Call the service to perform the logic
    const data = await getHackathonCompletionPercentageService(technologyOwnerId, hackathonId);

    // 3. Build and return a successful response
    return buildResponse({
      message: "Hackathon completion percentage retrieved successfully",
      data,
    });
  } catch (error: any) {
    const isUnauthorized = error.message?.toLowerCase().includes("unauthorized");
    return buildResponse({
      message: error.message ?? "Failed to retrieve completion percentage",
      isError: true,
      status: isUnauthorized ? 403 : 500,
      data: null,
    });
  }
};

export const editHackathonDetailsController = async (
  technologyOwnerIdStr: string,
  hackathonIdStr: string,
  body: any
) => {
  try {
    // 1. Validate URL parameters
    const technologyOwnerId = parseInt(technologyOwnerIdStr);
    const hackathonId = parseInt(hackathonIdStr);
    if (isNaN(technologyOwnerId) || isNaN(hackathonId)) {
      return buildResponse({
        message: "Invalid Owner or Hackathon ID.",
        isError: true,
        status: 400,
        data: null,
      });
    }

    // 2. Validate the request body against the schema
    const validatedBody = await updateHackathonDetailsSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // 3. Call the service with validated data
    const result = await editHackathonDetailsService(technologyOwnerId, hackathonId, validatedBody);

    // 4. Build a successful response
    return buildResponse({
      message: "Hackathon details updated successfully",
      data: result,
    });
  } catch (error: any) {
    const isUnauthorized = error.message?.toLowerCase().includes("unauthorized");
    return buildResponse({
      message: error.message ?? "Failed to update details",
      isError: true,
      status: isUnauthorized ? 403 : error.name === "ValidationError" ? 400 : 500,
      data: null,
    });
  }
};
