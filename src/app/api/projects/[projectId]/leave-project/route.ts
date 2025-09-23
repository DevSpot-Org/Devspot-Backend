import { NextResponse, type NextRequest } from "next/server";

import { leaveProjectController } from "@/modules/projects/controllers/membership.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    return await leaveProjectController(projectId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to leave project" },
      { status: 400 }
    );
  }
};
