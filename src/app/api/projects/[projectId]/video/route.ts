import { NextResponse, type NextRequest } from "next/server";

import {
  deleteVideoController,
  uploadVideoController,
} from "@/modules/projects/controllers/media.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const formData = await request.formData();
    return await uploadVideoController(projectId, formData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to upload video" },
      { status: 400 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    return await deleteVideoController(projectId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to delete video" },
      { status: 400 }
    );
  }
};
