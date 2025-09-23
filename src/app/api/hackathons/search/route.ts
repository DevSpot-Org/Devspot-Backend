import { search_hackathons } from "@/lib/services/hackathons";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { errorResponse } from "@/utils/response-helpers";
import { type NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const search_params = request.nextUrl.searchParams;

  const paramsObject = parseRequestParams(search_params);

  if (!paramsObject.search_term)
    return errorResponse("Invalid Search Term", 400);

  return await search_hackathons(paramsObject);
};
