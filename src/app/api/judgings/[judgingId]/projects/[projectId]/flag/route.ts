import { flagProjectController } from "@/modules/judging/controllers/judging-entry.controller";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { judgingId: string; projectId: string } }
) => {
  const body = await request.json();
  return await flagProjectController(params, body);
};
