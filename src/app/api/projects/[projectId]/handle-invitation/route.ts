import { NextResponse, type NextRequest } from "next/server";

import { handleInvitationController } from "@/modules/projects/controllers/membership.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const body = {
      handler_type: searchParams.get("handler_type") as "approve" | "reject",
      transaction_id: searchParams.get("transaction_id"),
    };

    return await handleInvitationController(projectId, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to handle invitation" },
      { status: 400 }
    );
  }
};
