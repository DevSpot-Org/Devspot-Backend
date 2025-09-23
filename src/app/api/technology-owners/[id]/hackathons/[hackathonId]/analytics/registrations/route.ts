import { getHackathonRegistrationsController } from "@/modules/technology-organization/controllers/hackathons.controller";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const { searchParams } = request.nextUrl;

    return await getHackathonRegistrationsController(params.hackathonId, searchParams);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "An unexpected server error occurred." },
      { status: 500 }
    );
  }
};
