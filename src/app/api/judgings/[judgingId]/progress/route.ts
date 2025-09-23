import { getJudgingProgressController } from "@/modules/judging/controllers/judging-management.controller";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ judgingId: string }> }
) => {
  const resolvedParams = await params;
  return await getJudgingProgressController(resolvedParams);
};
