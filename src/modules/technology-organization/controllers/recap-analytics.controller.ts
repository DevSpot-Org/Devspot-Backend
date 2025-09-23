import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import { getHackathonRecapAnalyticsService } from "../services/recap-analytics.service";

export const getHackathonRecapAnalyticsController = async (
  technologyOwnerId: string,
  hackathonId: string,
  specificEndpoint?: string
) => {
  try {
    // Parse and validate parameters
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

    // Call the service to get analytics data based on specific endpoint
    const analytics = await getHackathonRecapAnalyticsService(
      parsedTechnologyOwnerId,
      parsedHackathonId,
      specificEndpoint
    );

    const message = specificEndpoint
      ? `Hackathon ${specificEndpoint} analytics retrieved successfully`
      : "Hackathon recap analytics retrieved successfully";

    return buildResponse({
      message,
      data: analytics,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap analytics",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
