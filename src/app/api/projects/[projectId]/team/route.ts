import { NextResponse, type NextRequest } from "next/server";

import { updateProjectTeamController } from "@/modules/projects/controllers/membership.controller";

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    return await updateProjectTeamController(projectId, body, origin);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update project team" },
      { status: 400 }
    );
  }
};
