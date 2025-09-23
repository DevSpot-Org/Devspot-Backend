import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import {
  getAuthUserProfileService,
  updateParticipantProfileService,
} from "../services/profile.service";

export const updateParticipantProfileController = async (body: any) => {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return buildResponse({
        message: "Unauthorized - Please log in",
        data: error,
        isError: true,
        status: 401,
      });
    }

    const result = await updateParticipantProfileService(user.id, body);

    return buildResponse({
      message: "User profile updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update User Profile",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const getAuthUserProfileController = async () => {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error || !user) {
      return buildResponse({
        message: "Unauthorized - Please log in",
        data: error,
        isError: true,
        status: 401,
      });
    }

    const result = await getAuthUserProfileService(user.id);

    return buildResponse({
      message: "User profile retrieved successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to get User Profile",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
