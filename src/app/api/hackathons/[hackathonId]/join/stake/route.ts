import { stake_for_hackathon } from "@/lib/services/hackathons";
import { createClient, SupabaseClient } from "@/lib/supabase";
import { Database } from "@/types/database";
import { NextRequest } from "next/server";

type Supabase = SupabaseClient

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  // const raw = request.cookies.get("payment-session")?.value;
  // if (!raw) return errorResponse("Missing payment session", 400);

  try {
    const supabase: Supabase = await createClient();

    const { data: hackathon, error } = await supabase
      .from("hackathons")
      .select("stake_amount")
      .eq("id", hackathon_id)
      .single();
    if (!hackathon || error || !hackathon.stake_amount)
      return errorResponse("Could not Retrieve Hackathon", 400);

    return await stake_for_hackathon(hackathon_id, hackathon.stake_amount);
  } catch (err: any) {
    console.error("Payment validation error:", err);
    return errorResponse(err?.message ?? "Failed to stake for Hackathon", 402);
  }
};
