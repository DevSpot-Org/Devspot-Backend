import { NextRequest } from "next/server";

import { create_challenge_prize, get_hackathon_prizes } from "@/lib/services/hackathons";
import parseRequestParams from "@/lib/services/utils/parseRequestParams";
import { createClient } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/utils/response-helpers";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const search_params = request.nextUrl.searchParams;
  const challenge_id = search_params.get("challenge_id");

  const paramsObject = {
    ...parseRequestParams(search_params),
    filter: challenge_id ? { challenge_id: parseInt(challenge_id) } : undefined,
  };

  return await get_hackathon_prizes(hackathon_id, paramsObject);
};

export const POST = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const hackathon_id = parseInt(params.hackathonId);
    if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

    const body = await request.json();
    const {
      challenge_id,
      title,
      rank,
      prize_usd,
      prize_tokens,
      prize_custom,
      company_partner_logo,
    } = body;

    if (!challenge_id || !title || !rank) {
      return errorResponse(
        "Missing required fields: challenge_id, title, and rank are required",
        400
      );
    }

    // Verify that the challenge belongs to the hackathon
    const supabase = await createClient();
    const { data: challenge, error: challengeError } = await supabase
      .from("hackathon_challenges")
      .select("id")
      .eq("id", challenge_id)
      .eq("hackathon_id", hackathon_id)
      .single();

    if (challengeError || !challenge) {
      return errorResponse("Challenge not found or does not belong to this hackathon", 400);
    }

    const result = await create_challenge_prize(challenge_id, {
      title,
      rank,
      prize_usd,
      prize_tokens,
      prize_custom,
      company_partner_logo,
    });

    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error?.message ?? "Failed to create prize", 500);
  }
};
