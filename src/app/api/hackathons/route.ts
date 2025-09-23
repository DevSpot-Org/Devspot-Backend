import {
  create_hackathon,
  get_all_hackathons,
} from "@/lib/services/hackathons";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { type NextRequest } from "next/server";

/**
 * GET handler for hackathons.
 *
 * This endpoint accepts query parameters to support filtering, sorting,
 * and pagination. The following query parameters are supported:
 *
 * - **page**: (number) The page number for pagination. Defaults to 1 if not provided.
 * - **page_size**: (number) The number of items to display per page. Defaults to 10 if not provided.
 * - **sort_by**: (string) The column by which results should be sorted.
 *               If not provided, default sorting (e.g., by `created_at`) can be applied.
 * - **order**: (string) The order of sorting. Use `"asc"` for ascending or `"desc"` for descending.
 *              Defaults to `"desc"` if not provided.
 * - **filter**: (string) A filter string in the format `column:value` which will be parsed
 *               and applied as an equality filter on the specified column. Multiple filters
 *               in one request are not currently supported in this implementation.
 *
 * Example URL:
 * ```
 * /api/hackathons?page=2&page_size=10&sort_by=name&order=asc&filter=status:active
 * ```
 */
export const GET = async (request: NextRequest) => {
  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  return await get_all_hackathons(paramsObject);
};

export const POST = async (request: NextRequest) => {
  const body = await request.json();

  return await create_hackathon(body);
};
