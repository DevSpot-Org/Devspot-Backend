import { delete_prize } from "@/lib/services/prizes";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string; prizeId: string } }
) => {
  try {
    const technologyOwnerId = parseInt(params.id);
    const hackathonId = parseInt(params.hackathonId);
    const prizeId = parseInt(params.prizeId);

    if (isNaN(technologyOwnerId)) {
      return errorResponse("Invalid technology owner ID", 400);
    }

    if (isNaN(hackathonId)) {
      return errorResponse("Invalid hackathon ID", 400);
    }

    if (isNaN(prizeId)) {
      return errorResponse("Invalid prize ID", 400);
    }

    return await delete_prize(prizeId, technologyOwnerId, hackathonId);
  } catch (error: any) {
    console.error("Error deleting prize:", error);
    return errorResponse(
      error?.message ?? "Failed to delete prize",
      500
    );
  }
}; 