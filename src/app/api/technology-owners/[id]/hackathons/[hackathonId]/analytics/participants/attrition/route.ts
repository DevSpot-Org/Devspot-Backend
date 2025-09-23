// app/api/hackathons/[hackathonId]/analytics/attrition/route.ts

import { getHackathonAttritionAnalyticsController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    return await getHackathonAttritionAnalyticsController(params.hackathonId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "An unexpected error occurred." },
      { status: 500 }
    );
  }
};
