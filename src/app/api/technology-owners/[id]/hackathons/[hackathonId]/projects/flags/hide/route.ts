import { toggle_project_hidden } from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { type NextRequest } from "next/server";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const technology_owner_id = parseInt(params.id);

    if (!technology_owner_id || isNaN(technology_owner_id)) {
      return errorResponse("Invalid Technology Owner ID", 400);
    }

    const body = await request.json();
    return await toggle_project_hidden(technology_owner_id, body);
  } catch (error: any) {
    return errorResponse(
      error?.message ?? "Failed to toggle project hidden status"
    );
  }
}; 