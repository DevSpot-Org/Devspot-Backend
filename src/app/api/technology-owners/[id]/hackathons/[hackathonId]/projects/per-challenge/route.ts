import { get_projects_per_challenge } from "@/lib/services/projects";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  try {
    const technologyOwnerId = parseInt(params.id);
    const hackathonId = parseInt(params.hackathonId);

    if (isNaN(technologyOwnerId)) {
      return errorResponse("Invalid technology owner ID", 400);
    }

    if (isNaN(hackathonId)) {
      return errorResponse("Invalid hackathon ID", 400);
    }

    return await get_projects_per_challenge(hackathonId);
  } catch (error: any) {
    console.error("Error fetching projects per challenge:", error);
    return errorResponse(
      error?.message ?? "Failed to fetch projects per challenge",
      500
    );
  }
}; 