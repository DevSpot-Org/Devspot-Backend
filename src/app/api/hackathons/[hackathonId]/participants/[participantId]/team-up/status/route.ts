import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { errorResponse, successResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { hackathonId: string; participantId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const participant_id = params.participantId;

  if (!hackathon_id || !participant_id)
    return errorResponse("Invalid Hackathon or Participant Id", 400);

  const { user, error } = await getAuthenticatedUser();

  if (error) return error;

  const supabase = await createClient();

  const { data, error: fetchError } = await supabase
    .from("team_up_requests")
    .select("id, status")
    .eq("hackathon_id", hackathon_id)
    .eq("sender_id", user?.id)
    .eq("receiver_id", participant_id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return errorResponse(fetchError?.message);
  }

  return successResponse(data);
};
