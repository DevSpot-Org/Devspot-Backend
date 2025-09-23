import { getAuthenticationUrlForGoogleCalendar } from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  return await getAuthenticationUrlForGoogleCalendar(hackathon_id);
};
