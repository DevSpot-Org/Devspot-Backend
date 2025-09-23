import { get_all_technology_owner_hackathons } from "@/lib/services/technology_owner";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { errorResponse } from "@/utils/response-helpers";
import { type NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  const technology_owner_id = parseInt(params.id);

  if (!technology_owner_id || isNaN(technology_owner_id)) {
    return errorResponse("Invalid technology owner ID", 400);
  }

  return await get_all_technology_owner_hackathons(
    technology_owner_id,
    paramsObject
  );
};
