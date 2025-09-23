import { NextRequest } from "next/server";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { get_available_teammates } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  return await get_available_teammates(hackathon_id, paramsObject?.search_term);
};
