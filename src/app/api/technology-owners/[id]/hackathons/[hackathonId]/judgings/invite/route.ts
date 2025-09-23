import { removeVipInviteController } from "@/modules/hackathon/controllers/vips.controller";
import { NextRequest } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get("identifier");

  return await removeVipInviteController(params.hackathonId, identifier);
};
