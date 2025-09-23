import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";

import {
  submitProjectService,
  updateProjectAllocationService,
} from "../services/management.service";

export const updateProjectAllocationController = async (projectId: string, allocationData: any) => {
  try {
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

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await updateProjectAllocationService(id, user.id, allocationData);
    return buildResponse({
      message: "Project allocation updated successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update project allocation",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const submitProjectController = async (projectId: string) => {
  try {
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

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await submitProjectService(id);
    return buildResponse({
      message: "Project submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to submit project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
