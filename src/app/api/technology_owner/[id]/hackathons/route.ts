import { type NextRequest } from "next/server";

import { getTechnologyOwnerHackathonsController } from "@/modules/technology-organization/controllers/tech-owner-profile.controller";
import parseRequestParams from "@/modules/technology-organization/utils/parseRequestParams";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const search_params = request.nextUrl.searchParams;
  const paramsObject = parseRequestParams(search_params);

  return await getTechnologyOwnerHackathonsController(id, paramsObject);
};
