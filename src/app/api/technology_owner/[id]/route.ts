import { type NextRequest } from "next/server";

import { getTechnologyOwnerByIdController } from "@/modules/technology-organization/controllers/tech-owner-profile.controller";

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  return await getTechnologyOwnerByIdController(id);
};
