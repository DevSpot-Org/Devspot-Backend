import { submitJudgingController } from "@/modules/judging/controllers/judging-management.controller";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  const resolvedParams = await params;
  return await submitJudgingController(resolvedParams);
};
