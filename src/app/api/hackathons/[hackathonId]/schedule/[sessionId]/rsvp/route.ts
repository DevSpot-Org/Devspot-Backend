import { NextRequest } from "next/server";

import { rsvp_hackathon_session } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const POST = async (
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) => {
  const session_id = parseInt(params.sessionId);

  if (!session_id) return errorResponse("Invalid Session Id", 400);
  const body = await request.json();

  return await rsvp_hackathon_session(session_id, body);
};
