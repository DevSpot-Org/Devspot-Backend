import { NextRequest } from "next/server";

import { get_hackathon_challenges } from "@/lib/services/hackathons";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const { hackathonId } = await params;

  const hackathon_id = parseInt(hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  return await get_hackathon_challenges(hackathon_id, paramsObject);
};
