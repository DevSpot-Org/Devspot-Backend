import { getHackathonRecapFeedbackController } from "@/modules/technology-organization/controllers/recap-feedback.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) => {
  try {
    const { id, hackathonId } = await params;

    return await getHackathonRecapFeedbackController(id, hackathonId, "participant-feedback");
  } catch (error: any) {
    return Response.json(
      { error: error?.message ?? "Failed to get participant feedback" },
      { status: 400 }
    );
  }
};
