import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import {
  getHackathonRecapEngagementFunnelService,
  getHackathonRecapEngagementPartnersService,
  getHackathonRecapRoleBreakdownService,
} from "../services/recap-engagement.service";

export const getHackathonRecapEngagementPartnersController = async (
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

    const engagementPartners = await getHackathonRecapEngagementPartnersService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap engagement partners retrieved successfully",
      data: engagementPartners,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap engagement partners",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapRoleBreakdownController = async (
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

    const roleBreakdown = await getHackathonRecapRoleBreakdownService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap role breakdown retrieved successfully",
      data: roleBreakdown,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap role breakdown",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getHackathonRecapEngagementFunnelController = async (
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

    const funnel = await getHackathonRecapEngagementFunnelService(
      parsedTechnologyOwnerId,
      parsedHackathonId
    );

    return buildResponse({
      message: "Hackathon recap engagement funnel retrieved successfully",
      data: funnel,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get hackathon recap engagement funnel",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
