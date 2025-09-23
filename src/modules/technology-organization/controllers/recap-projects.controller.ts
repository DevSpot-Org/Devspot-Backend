import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import { NextRequest } from "next/server";
import {
  getHackathonRecapProjectsJudgingAndWinnersService,
  getHackathonRecapProjectsJudgingCriteriaScoresService,
  getHackathonRecapProjectsPrizeAndPaymentService,
  getHackathonRecapProjectsPrizesPerWinningProjectsService,
  getHackathonRecapProjectsProjectSubmissionsService,
  getHackathonRecapProjectsSubmissionsPerChallengeService,
  getHackathonRecapProjectsTechnologiesCountService,
  getHackathonRecapProjectsTechnologiesUsedService,
  getHackathonRecapProjectsTotalPerScoreChartService,
  getHackathonRecapProjectsTotalPerScoreSummaryService,
  getHackathonRecapProjectsTypeBreakdownService,
  getHackathonRecapProjectsWinningProjectPerPrizeService,
} from "../services/recap-projects.service";

export const getHackathonRecapProjectsTypeBreakdownController = async (
  technologyOwnerId: string,
  hackathonId: string
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const typeBreakdown = await getHackathonRecapProjectsTypeBreakdownService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects type breakdown retrieved successfully",
      data: typeBreakdown,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects type breakdown",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsSubmissionsPerChallengeController = async (
  technologyOwnerId: string,
  hackathonId: string
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const submissionsPerChallenge = await getHackathonRecapProjectsSubmissionsPerChallengeService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects submissions per challenge retrieved successfully",
      data: submissionsPerChallenge,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects submissions per challenge",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsTechnologiesCountController = async (
  technologyOwnerId: string,
  hackathonId: string
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const technologiesCount = await getHackathonRecapProjectsTechnologiesCountService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects technologies count retrieved successfully",
      data: technologiesCount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects technologies count",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsTechnologiesUsedController = async (
  technologyOwnerId: string,
  hackathonId: string
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const technologiesUsed = await getHackathonRecapProjectsTechnologiesUsedService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects technologies used retrieved successfully",
      data: technologiesUsed,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects technologies used",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsJudgingCriteriaScoresController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const judgingCriteriaScores = await getHackathonRecapProjectsJudgingCriteriaScoresService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects judging criteria scores retrieved successfully",
      data: judgingCriteriaScores,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects judging criteria scores",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsPrizesPerWinningProjectsController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const prizesPerWinningProjects = await getHackathonRecapProjectsPrizesPerWinningProjectsService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects prizes per winning projects retrieved successfully",
      data: prizesPerWinningProjects,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message:
        error?.message ?? "Failed to get hackathon recap projects prizes per winning projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsWinningProjectPerPrizeController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const winningProjectPerPrize = await getHackathonRecapProjectsWinningProjectPerPrizeService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects winning project per prize retrieved successfully",
      data: winningProjectPerPrize,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects winning project per prize",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsPrizeAndPaymentController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const prizeAndPayment = await getHackathonRecapProjectsPrizeAndPaymentService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects prize and payment retrieved successfully",
      data: prizeAndPayment,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects prize and payment",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsProjectSubmissionsController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const projectSubmissions = await getHackathonRecapProjectsProjectSubmissionsService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap projects project submissions retrieved successfully",
      data: projectSubmissions,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects project submissions",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsJudgingAndWinnersController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const judgingAndWinners = await getHackathonRecapProjectsJudgingAndWinnersService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects judging and winners retrieved successfully",
      data: judgingAndWinners,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects judging and winners",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsTotalPerScoreSummaryController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const totalPerScoreSummary = await getHackathonRecapProjectsTotalPerScoreSummaryService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects total per score summary retrieved successfully",
      data: totalPerScoreSummary,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects total per score summary",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapProjectsTotalPerScoreChartController = async (
  technologyOwnerId: string,
  hackathonId: string,
  request: NextRequest
) => {
  try {
    const parsedTechnologyOwnerId = parseInt(technologyOwnerId);
    const parsedHackathonId = parseInt(hackathonId);

    if (!parsedTechnologyOwnerId || isNaN(parsedTechnologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    if (!parsedHackathonId || isNaN(parsedHackathonId)) {
      return buildResponse({
        message: "Invalid Hackathon ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Parse challenge IDs from query parameters
    const { searchParams } = new URL(request.url);
    const challengeIdsParam = searchParams.get("challengeIds");

    if (!challengeIdsParam) {
      return buildResponse({
        message: "Challenge IDs parameter is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const challengeIds = challengeIdsParam
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    if (challengeIds.length === 0) {
      return buildResponse({
        message: "Invalid challenge IDs provided",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();
    if (authError || !user) {
      return (
        authError ||
        buildResponse({
          message: "Authentication required",
          data: null,
          isError: true,
          status: 401,
        })
      );
    }

    const totalPerScoreChart = await getHackathonRecapProjectsTotalPerScoreChartService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      challengeIds
    );

    return buildResponse({
      message: "Hackathon recap projects total per score chart retrieved successfully",
      data: totalPerScoreChart,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap projects total per score chart",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
