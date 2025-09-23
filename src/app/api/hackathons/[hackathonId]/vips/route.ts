import { NextRequest } from "next/server";

import { get_hackathon_vips } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  return await get_hackathon_vips(hackathon_id);
};
