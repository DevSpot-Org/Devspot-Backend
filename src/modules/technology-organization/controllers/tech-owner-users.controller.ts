import { buildResponse } from "@/utils/buildResponse";

import { inviteMemberToTechnologyOwnerService } from "../services/tech-owner-users.service";

export const inviteMemberToTechnologyOwnerController = async (id: string, body: any) => {
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

    if (!body.email && !body.selectedUsers) {
      return buildResponse({
        message: "Email or Selected Users is required",
        data: null,
        isError: true,
        status: 400,
      });
    }

    const result = await inviteMemberToTechnologyOwnerService(technologyOwnerId, {
      email: body?.email,
      selectedUsers: body?.selectedUsers,
    });

    return buildResponse({
      message: "Member invited successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to invite member to Technology Owner",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
