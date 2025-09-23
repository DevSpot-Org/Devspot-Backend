import { NextRequest } from "next/server";

import { leave_hackathon } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  return await leave_hackathon(hackathon_id);
};
