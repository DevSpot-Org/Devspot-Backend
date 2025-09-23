import { getHackathonRecapProjectsJudgingAndWinnersController } from "@/modules/technology-organization/controllers/recap-projects.controller";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) {
  const { id, hackathonId } = await params;
  return getHackathonRecapProjectsJudgingAndWinnersController(id, hackathonId, request);
}
