import { editHackathonDetailsController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  try {
    const body = await request.json();
    return await editHackathonDetailsController(params.id, params.hackathonId, body);
  } catch (error: any) {
    // Catch JSON parsing errors or other unexpected issues
    return NextResponse.json(
      { error: error?.message ?? "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
