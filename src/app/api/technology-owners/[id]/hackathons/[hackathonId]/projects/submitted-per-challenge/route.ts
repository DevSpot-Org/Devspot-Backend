import { NextRequest } from "next/server";
import { get_challenge_submission_stats } from "@/lib/services/projects";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathonId = parseInt(params.hackathonId);

  if (!hackathonId || isNaN(hackathonId)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  return await get_challenge_submission_stats(hackathonId);
};
