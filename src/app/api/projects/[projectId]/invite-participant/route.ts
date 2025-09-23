import { NextResponse, type NextRequest } from "next/server";

import { inviteParticipantController } from "@/modules/projects/controllers/membership.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const body = await request.json();
    return await inviteParticipantController(projectId, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to invite participant" },
      { status: 400 }
    );
  }
};
