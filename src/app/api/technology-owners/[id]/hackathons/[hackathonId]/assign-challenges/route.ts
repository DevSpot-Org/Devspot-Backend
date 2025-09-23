import { assignChallengesToProjectsController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const body = await request.json();

    return await assignChallengesToProjectsController(params.hackathonId, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
