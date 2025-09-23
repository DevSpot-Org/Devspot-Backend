import { NextRequest } from "next/server";

import { update_hackathon_vips_office_hour_count } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) return errorResponse("Invalid Hackathon Id", 400);

  return await update_hackathon_vips_office_hour_count(hackathon_id, user_id);
};
