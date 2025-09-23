import { getHackathonRegistrationAnalyticsController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const { searchParams } = request.nextUrl;
    const granularity = searchParams.get("granularity");

    // Pass both the hackathonId and the granularity query to the controller
    return await getHackathonRegistrationAnalyticsController(params.hackathonId, granularity);
  } catch (error: any) {
    // A final safety net for any uncaught errors
    return NextResponse.json(
      { error: error?.message ?? "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
