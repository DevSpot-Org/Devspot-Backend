import { NextResponse, type NextRequest } from "next/server";

import {
  deleteHeaderImageController,
  uploadHeaderImageController,
} from "@/modules/projects/controllers/media.controller";

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const formData = await request.formData();
    return await uploadHeaderImageController(projectId, formData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to upload header image" },
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
    return await deleteHeaderImageController(projectId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to delete header image" },
      { status: 400 }
    );
  }
};
