import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";

import {
  handleInvitationService,
  inviteParticipantService,
  leaveProjectService,
  requestToJoinProjectService,
  updateProjectTeamService,
} from "../services/membership.service";
import { inviteParticipantSchema } from "../validators/membership.validator";
import { teamMemberFormSchema } from "../validators/team.validator";

export const handleInvitationController = async (projectId: string, body: any) => {
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

    const handlerType = body.handler_type || body.action;
    if (!handlerType || !["approve", "reject"].includes(handlerType)) {
      return buildResponse({
        message: "Invalid action. Must be 'approve' or 'reject'",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const transactionId = body.transaction_id || body.transactionId;
    if (!transactionId) {
      return buildResponse({
        message: "transaction_id is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await handleInvitationService(id, user.id, handlerType, transactionId);
    return buildResponse({
      message: "Invitation handled successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to update invitation",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const inviteParticipantController = async (projectId: string, body: any) => {
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

    const validated_body = await inviteParticipantSchema.validate(body);
    const result = await inviteParticipantService(id, validated_body);
    return buildResponse({
      message: "Participant invited successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to invite teammate",
      data: error,
      isError: true,
      status: 400,
    });
  }
};

export const leaveProjectController = async (projectId: string) => {
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

    const result = await leaveProjectService(id, user.id);
    return buildResponse({
      message: "Left project successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to leave project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const requestToJoinController = async (projectId: string, body: any) => {
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

    const result = await requestToJoinProjectService(id, user.id);
    return buildResponse({
      message: "Join request submitted successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to request to join project",
      data: err,
      isError: true,
      status: 400,
    });
  }
};

export const updateProjectTeamController = async (projectId: string, body: any, origin: string) => {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const id = parseInt(projectId);
    if (!id || isNaN(id)) {
      return buildResponse({
        message: "Invalid Project ID",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const validated_body = await teamMemberFormSchema.validate(body);

    const result = await updateProjectTeamService(id, user, origin, validated_body);
    return buildResponse({
      message: "Project team updated successfully",
      data: result,
    });
  } catch (error: any) {
    return buildResponse({
      message: error?.message ?? "Failed to update project team",
      data: error,
      isError: true,
      status: 400,
    });
  }
};
