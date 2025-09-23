import { invite_member_to_technology_owner } from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { type NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const technology_owner_id = parseInt(params.id);

  if (!technology_owner_id || isNaN(technology_owner_id)) {
    return errorResponse("Invalid Technology Owner ID", 400);
  }

  const body = await request.json();

  if (!body.email && !body.selectedUsers) {
    return errorResponse("Email or Selected Users is required", 400);
  }

  return await invite_member_to_technology_owner(technology_owner_id, {
    email: body?.email,
    selectedUsers: body?.selectedUsers,
  });
};
  