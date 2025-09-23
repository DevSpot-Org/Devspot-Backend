import { get_hackathon_challenges_with_prizes } from "@/lib/services/prizes";
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

    return await get_hackathon_challenges_with_prizes(hackathonId, technologyOwnerId);
  } catch (error: any) {
    console.error("Error fetching hackathon challenges with prizes:", error);
    return errorResponse(
      error?.message ?? "Failed to fetch hackathon challenges with prizes",
      500
    );
  }
}; 