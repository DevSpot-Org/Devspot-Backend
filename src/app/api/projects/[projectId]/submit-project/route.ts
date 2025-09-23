import { NextRequest, NextResponse } from "next/server";

import { submitProjectController } from "@/modules/projects/controllers/management.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    return await submitProjectController(projectId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to submit project" },
      { status: 400 }
    );
  }
};
