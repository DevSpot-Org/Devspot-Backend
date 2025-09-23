import {
  getProjectDetailsController,
  submitJudgingEntryController,
  updateJudgingEntryController,
} from "@/modules/judging/controllers/judging-entry.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ judgingId: string; projectId: string }> }
) => {
  const searchParams = request.nextUrl.searchParams;
  const resolvedParams = await params;
  return await getProjectDetailsController(resolvedParams, searchParams);
};

export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ judgingId: string; projectId: string }> }
) => {
  const body = await request.json();
  const resolvedParams = await params;
  return await submitJudgingEntryController(resolvedParams, body);
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ judgingId: string; projectId: string }> }
) => {
  const body = await request.json();
  const resolvedParams = await params;
  return await updateJudgingEntryController(resolvedParams, body);
};
