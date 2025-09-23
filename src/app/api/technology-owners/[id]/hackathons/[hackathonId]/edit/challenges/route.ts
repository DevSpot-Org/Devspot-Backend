import {
  delete_hackathon_challenge,
  edit_hackathon_challenges,
} from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const technology_owner_id = parseInt(params.id);

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }
  if (!technology_owner_id || isNaN(technology_owner_id)) {
    return errorResponse("Invalid technology owner ID", 400);
  }

  const formData = await request.formData();

  return await edit_hackathon_challenges(
    technology_owner_id,
    hackathon_id,
    formData
  );
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  const search_params = request.nextUrl.searchParams;
  const hackathon_id = parseInt(params.hackathonId);
  const challenge_id = parseInt(search_params.get("challenge_id") || "");

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  if (!challenge_id) {
    return errorResponse("Invalid Challenge Id", 400);
  }

  return await delete_hackathon_challenge(hackathon_id, challenge_id);
};
