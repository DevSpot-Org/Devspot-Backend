import { NextRequest } from "next/server";

import { send_team_up_request } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const POST = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string; participantId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const participant_id = params.participantId;

  if (!hackathon_id || !participant_id)
    return errorResponse("Invalid Hackathon or Participant Id", 400);

  const origin = request.nextUrl.origin;

  return await send_team_up_request(hackathon_id, participant_id, origin);
};
