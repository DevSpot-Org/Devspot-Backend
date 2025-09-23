import { get_hackathon_challenges_with_judge_progress } from "@/lib/services/judging";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { user_id: string; judging_id: string } }
) => {
  const judging_id = parseInt(params.judging_id);

  if (!judging_id || isNaN(judging_id)) {
    return errorResponse("Invalid Judging Id", 400);
  }

  return await get_hackathon_challenges_with_judge_progress(judging_id);
};
