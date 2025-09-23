import { type NextRequest } from "next/server";

import { toggleFollowTechnologyOwnerController } from "@/modules/technology-organization/controllers/tech-owner-profile.controller";

export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await toggleFollowTechnologyOwnerController(id);
};
