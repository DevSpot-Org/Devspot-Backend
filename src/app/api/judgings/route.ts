import { createJudgingController } from "@/modules/judging/controllers/judging-management.controller";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  return await createJudgingController(body);
};
