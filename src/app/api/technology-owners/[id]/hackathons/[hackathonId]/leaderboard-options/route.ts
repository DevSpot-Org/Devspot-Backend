import { update_hackathon_leaderboard_options } from "@/lib/services/hackathons";
import { errorResponse, successResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";
import * as yup from "yup";

const hackathonLeaderboardOptionsSchema = yup.object({
  comments: yup.boolean().required(),
  score: yup.boolean().required(),
  sortBy: yup
    .mixed<"standing" | "score" | "challenge">()
    .oneOf(["standing", "score", "challenge"])
    .optional(),
});

export const PUT = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const hackathon_id = parseInt(params.hackathonId);
    if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

    const body = await request.json();

    const requestBody = await hackathonLeaderboardOptionsSchema.validate(body);

    const result = await update_hackathon_leaderboard_options(
      hackathon_id,
      requestBody
    );

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error?.message ?? "Failed to update leaderboard options", 500);
  }
};
