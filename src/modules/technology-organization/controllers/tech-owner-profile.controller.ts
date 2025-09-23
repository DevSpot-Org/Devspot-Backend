import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";

import {
  getAllTechnologyOwnersService,
  getTechnologyOwnerByIdService,
  getTechnologyOwnerHackathonsService,
  getTechnologyOwnerProjectsService,
  searchTechnologyOwnersService,
  toggleFollowTechnologyOwnerService,
  updateTechnologyOwnerService,
} from "../services/tech-owner-profile.service";

export const getTechnologyOwnerByIdController = async (id: string) => {
  try {
    const technologyOwnerId = parseInt(id);
    const { user } = await getAuthenticatedUser();

    if (!technologyOwnerId || isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await getTechnologyOwnerByIdService(technologyOwnerId, user?.id);

    return buildResponse({
      message: "Technology Owner retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get Technology Owner",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getAllTechnologyOwnersController = async () => {
  try {
    const result = await getAllTechnologyOwnersService();

    return buildResponse({
      message: "Technology Owners retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get Technology Owners",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getTechnologyOwnerHackathonsController = async (id: string, options: any) => {
  try {
    const technologyOwnerId = parseInt(id);

    if (!technologyOwnerId || isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await getTechnologyOwnerHackathonsService(technologyOwnerId, options);

    return buildResponse({
      message: "Technology Owner hackathons retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get Technology Owner Hackathons",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getTechnologyOwnerProjectsController = async (id: string) => {
  try {
    const technologyOwnerId = parseInt(id);

    if (!technologyOwnerId || isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await getTechnologyOwnerProjectsService(technologyOwnerId);

    return buildResponse({
      message: "Technology Owner projects retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get Technology Owner Projects",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const toggleFollowTechnologyOwnerController = async (id: string) => {
  try {
    const technologyOwnerId = parseInt(id);

    if (!technologyOwnerId || isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Handle authentication
    const { error: authError, user } = await getAuthenticatedUser();
    if (authError) return authError;

    if (!user?.id) {
      return buildResponse({
        message: "User not authenticated",
        data: null,
        isError: true,
        status: 401,
      });
    }

    const result = await toggleFollowTechnologyOwnerService(technologyOwnerId, user.id);

    return buildResponse({
      message: "Technology Owner follow status updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to follow Technology Owner",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateTechnologyOwnerController = async (id: string, formData: FormData) => {
  try {
    const technologyOwnerId = parseInt(id);

    if (!technologyOwnerId || isNaN(technologyOwnerId)) {
      return buildResponse({
        message: "Invalid Technology Owner ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    // Handle authentication
    const { error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const result = await updateTechnologyOwnerService(technologyOwnerId, formData);

    return buildResponse({
      message: "Technology Owner updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update Technology Owner",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const searchTechnologyOwnersController = async (searchTerm: string) => {
  try {
    if (!searchTerm) {
      return buildResponse({
        message: "Invalid Search Term",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await searchTechnologyOwnersService(searchTerm);

    return buildResponse({
      message: "Technology Owners search completed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to search Technology Owners",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
