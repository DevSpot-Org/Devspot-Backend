import { getHackathonRecapProjectsTypeBreakdownController } from "@/modules/technology-organization/controllers/recap-projects.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hackathonId: string }> }
) => {
  try {
    const { id, hackathonId } = await params;

    return await getHackathonRecapProjectsTypeBreakdownController(id, hackathonId);
  } catch (error: any) {
    return Response.json(
      { error: error?.message ?? "Failed to get hackathon recap projects type breakdown" },
      { status: 400 }
    );
  }
};
