import { NextRequest } from "next/server";
import { get_judging_projects } from "@/lib/services/judging";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { user_id: string; judging_id: string } }
) => {
  const judging_id = parseInt(params.judging_id);
  const user_id = params.user_id;

  if (!judging_id || isNaN(judging_id)) {
    return errorResponse("Invalid Judging Id", 400);
  }

  return await get_judging_projects(judging_id, user_id);
};
