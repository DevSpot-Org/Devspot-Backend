import { get_judging_projects_ungrouped } from "@/lib/services/judging";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { user_id: string; judging_id: string } }
) => {
  const judging_id = parseInt(params.judging_id);
  const user_id = params.user_id;

  if (!judging_id || isNaN(judging_id)) {
    return errorResponse("Invalid Judging Id", 400);
  }

  return await get_judging_projects_ungrouped(judging_id, user_id);
};
