import { get_all_users } from "@/lib/services/people";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  return await get_all_users(paramsObject);
};
