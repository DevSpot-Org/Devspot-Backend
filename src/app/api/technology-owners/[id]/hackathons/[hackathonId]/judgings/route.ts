import JudgingService from "@/lib/services/judging/services/judging.service";
import { add_hackathon_judges, remove_hackathon_judge } from "@/lib/services/technology_owner";
import { createClient } from "@/lib/supabase";
import { errorResponse, successResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) {
  try {
    const supabase = await createClient();
    const judgingService = new JudgingService(supabase);

    // Verify the technology owner has access to this hackathon
    const { data: hackathon, error: hackathonError } = await supabase
      .from("hackathons")
      .select("organizer_id")
      .eq("id", params.hackathonId)
      .single();

    if (hackathonError) {
      return errorResponse("Hackathon not found", 404);
    }

    if (hackathon.organizer_id !== parseInt(params.id)) {
      return errorResponse("Unauthorized access to hackathon", 403);
    }

    const judges = await judgingService.getHackathonJudges(parseInt(params.hackathonId));
    return successResponse(judges);
  } catch (error) {
    console.error("Error fetching hackathon judges:", error);
    return errorResponse("Failed to fetch hackathon judges", 500);
  }
}

export const POST = async (
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

  const body = await request.json();

  return await add_hackathon_judges(hackathon_id, body);
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const technology_owner_id = parseInt(params.id);
  const { searchParams } = new URL(request.url);
  const judgeId = searchParams.get("judge_id");

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }
  if (!technology_owner_id || isNaN(technology_owner_id)) {
    return errorResponse("Invalid technology owner ID", 400);
  }

  if (!judgeId) {
    return errorResponse("Invalid judge ID", 400);
  }

  return await remove_hackathon_judge(hackathon_id, judgeId);
};
