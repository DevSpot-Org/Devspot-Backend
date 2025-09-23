import { NextResponse, type NextRequest } from "next/server";

import {
  getTechnologyOwnerByIdController,
  updateTechnologyOwnerController,
} from "@/modules/technology-organization/controllers/tech-owner-profile.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    return await getTechnologyOwnerByIdController(id);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to get Technology Owner" },
      { status: 400 }
    );
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.formData();
    return await updateTechnologyOwnerController(id, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update Technology Owner" },
      { status: 400 }
    );
  }
};
