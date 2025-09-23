import { createClient, SupabaseClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { Database } from "@/types/database";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest, NextResponse } from "next/server";

type Supabase = SupabaseClient

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  try {
    const hackathonId = parseInt(params.hackathonId);

    if (!hackathonId || isNaN(hackathonId)) {
      return errorResponse("Invalid hackathon Owner ID", 400);
    }

    const supabase: Supabase = await createClient();

    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { data: hackathonStake } = await supabase
      .from("hackathon_stakes")
      .select("status")
      .eq("participant_id", user?.id)
      .eq("hackathon_id", hackathonId)
      .single();

    return NextResponse.json({
      status: hackathonStake?.status ?? "pending",
      hackathonId,
    });
  } catch (error: any) {
    return errorResponse(error?.message ?? "Failed to get Technology Owner's projects");
  }
};
