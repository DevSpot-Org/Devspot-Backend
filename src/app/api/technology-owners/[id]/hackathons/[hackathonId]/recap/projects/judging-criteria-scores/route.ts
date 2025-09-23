import { getHackathonRecapProjectsJudgingCriteriaScoresController } from "@/modules/technology-organization/controllers/recap-projects.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) => {
  try {
    const { id, hackathonId } = await params;
    return await getHackathonRecapProjectsJudgingCriteriaScoresController(id, hackathonId, request);
  } catch (error: any) {
    return Response.json(
      { error: error?.message ?? "Failed to get hackathon recap projects judging criteria scores" },
      { status: 400 }
    );
  }
};
