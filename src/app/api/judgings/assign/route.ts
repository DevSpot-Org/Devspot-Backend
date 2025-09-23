import { assignProjectsController } from "@/modules/judging/controllers/judging-management.controller";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  return await assignProjectsController(body);
};
