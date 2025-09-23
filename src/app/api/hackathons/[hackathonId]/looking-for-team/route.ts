import { NextRequest } from "next/server";

import {
  get_a_hackathon,
  update_hackathon_participate_membership_status,
} from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);
  const body = await request.json();

  return await update_hackathon_participate_membership_status(
    hackathon_id,
    body
  );
};
