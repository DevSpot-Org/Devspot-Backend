import { getUsedTechnologiesInHackathonController } from "@/modules/hackathon";
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

    return await getUsedTechnologiesInHackathonController(hackathonId);
  } catch (error: any) {
    console.error("Error fetching technologies from challenges:", error);
    return errorResponse(error?.message ?? "Failed to fetch technologies from challenges", 500);
  }
};
