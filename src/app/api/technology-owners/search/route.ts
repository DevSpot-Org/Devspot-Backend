import { NextResponse, type NextRequest } from "next/server";

import { searchTechnologyOwnersController } from "@/modules/technology-organization/controllers/tech-owner-profile.controller";
import parseRequestParams from "@/modules/technology-organization/utils/parseRequestParams";

export const GET = async (request: NextRequest) => {
  try {
    const search_params = request.nextUrl.searchParams;
    const paramsObject = parseRequestParams(search_params);

    if (!paramsObject.search_term) {
      return NextResponse.json({ error: "Invalid Search Term" }, { status: 400 });
    }

    return await searchTechnologyOwnersController(paramsObject.search_term);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to retrieve Technology Owner" },
      { status: 400 }
    );
  }
};
