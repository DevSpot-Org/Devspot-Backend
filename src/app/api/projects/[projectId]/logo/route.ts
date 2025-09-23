import { NextResponse, type NextRequest } from "next/server";

import {
  deleteLogoController,
  uploadLogoController,
} from "@/modules/projects/controllers/media.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const formData = await request.formData();
    return await uploadLogoController(projectId, formData);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Failed to upload logo" }, { status: 400 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    return await deleteLogoController(projectId);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Failed to delete logo" }, { status: 400 });
  }
};
