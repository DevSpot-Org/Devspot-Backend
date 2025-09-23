import { NextRequest } from "next/server";
import { get_projects_for_challenge } from "@/lib/services/prizes";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { challengeId: string } }
) => {
  const challenge_id = parseInt(params.challengeId);

  if (!challenge_id || isNaN(challenge_id)) {
    return errorResponse("Invalid challengeId", 400);
  }

  return await get_projects_for_challenge(challenge_id);
};