import { NextResponse, type NextRequest } from "next/server";

import { getAllTechnologyOwnersController } from "@/modules/technology-organization/controllers/tech-owner-profile.controller";

export const GET = async (request: NextRequest) => {
  try {
    return await getAllTechnologyOwnersController();
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to get Technology Owners" },
      { status: 400 }
    );
  }
};
