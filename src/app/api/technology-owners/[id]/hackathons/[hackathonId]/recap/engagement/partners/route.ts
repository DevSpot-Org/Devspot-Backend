import { getHackathonRecapEngagementPartnersController } from "@/modules/technology-organization/controllers/recap-engagement.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) => {
  try {
    const { id, hackathonId } = await params;

    return await getHackathonRecapEngagementPartnersController(id, hackathonId);
  } catch (error: any) {
    return Response.json(
      { error: error?.message ?? "Failed to get hackathon recap engagement partners" },
      { status: 400 }
    );
  }
};
