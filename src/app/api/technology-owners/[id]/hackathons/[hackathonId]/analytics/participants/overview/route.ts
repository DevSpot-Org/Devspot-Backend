import { getHackathonAnalyticsOverviewController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    // Pass the hackathonId from the URL directly to the controller
    return await getHackathonAnalyticsOverviewController(params.hackathonId);
  } catch (error: any) {
    // Catch any unexpected errors that bubble up
    return NextResponse.json(
      { error: error?.message ?? "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
