import { NextRequest, NextResponse } from "next/server";

import { updateProjectAllocationController } from "@/modules/projects/controllers/management.controller";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const body = await request.json();
    return await updateProjectAllocationController(projectId, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update project allocation" },
      { status: 400 }
    );
  }
};
