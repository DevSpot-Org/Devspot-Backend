import { NextResponse, type NextRequest } from "next/server";

import {
  deleteProjectController,
  getProjectByIdController,
  updateProjectController,
} from "@/modules/projects/controllers/projects.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    return await getProjectByIdController(projectId);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Failed to get project" }, { status: 400 });
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) => {
  try {
    const { projectId } = await params;
    const body = await request.json();
    return await updateProjectController(projectId, body);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update project" },
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
    return await deleteProjectController(projectId);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to delete project" },
      { status: 400 }
    );
  }
};
