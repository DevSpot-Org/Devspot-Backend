import { NextRequest } from "next/server";

import {
  get_user_hackathon_feedback,
  submit_user_hackathon_feedback,
} from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  return await get_user_hackathon_feedback(hackathon_id);
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { hackathonId: string; challengeId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const body = await req.json();

  return await submit_user_hackathon_feedback(hackathon_id, body);
};
