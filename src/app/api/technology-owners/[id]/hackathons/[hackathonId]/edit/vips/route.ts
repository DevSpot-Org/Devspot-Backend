import { edit_hackathon_vips } from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  const body = await request.json();

  return await edit_hackathon_vips(hackathon_id, body);
};
