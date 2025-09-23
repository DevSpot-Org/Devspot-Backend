import { get_hackathon_challenges_search } from "@/lib/services/hackathons";
import { createClient } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const search_params = request.nextUrl.searchParams;

  const minimal = search_params.get("minimal");
  if (minimal === "true") {
    return await get_hackathon_challenges_search(hackathon_id);
  }

  const input = search_params.get("input");

  const supabase = await createClient();

  let query = supabase
    .from("hackathon_challenges")
    .select(
      `
          *,
          prizes:hackathon_challenge_bounties (
            id,
            title,
            rank,
            prize_usd,
            prize_tokens,
            prize_custom,
            company_partner_logo
          )
        `
    )
    .eq("hackathon_id", hackathon_id)
    .order("created_at", { ascending: true });

  if (input && input.trim() !== "") {
    query = query.ilike("challenge_name", `%${input.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(error?.message);
  }

  return successResponse(data);
};
