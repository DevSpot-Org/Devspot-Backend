import { get_hackathon_leaderboard } from "@/lib/services/hackathons";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  return await get_hackathon_leaderboard(hackathon_id, paramsObject?.sort_by);
};
