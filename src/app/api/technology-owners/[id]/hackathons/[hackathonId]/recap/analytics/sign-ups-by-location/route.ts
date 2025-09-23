import { getHackathonRecapAnalyticsController } from "@/modules/technology-organization/controllers/recap-analytics.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) => {
  try {
    const { id, hackathonId } = await params;

    return await getHackathonRecapAnalyticsController(id, hackathonId, "sign-ups-by-location");
  } catch (error: any) {
    return Response.json(
      { error: error?.message ?? "Failed to get sign-ups by location analytics" },
      { status: 400 }
    );
  }
};
