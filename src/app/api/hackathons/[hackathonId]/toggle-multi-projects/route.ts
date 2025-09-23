import {
  get_hackathon_multi_project_status,
  toggle_hackathon_multi_project,
} from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);

  const { searchParams } = new URL(request.url);
  const rawValue = searchParams.get("value");
  const state = rawValue === "true";

  return await toggle_hackathon_multi_project(hackathon_id, state);
};

export const GET = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id || isNaN(hackathon_id)) {
    return errorResponse("Invalid Hackathon Id", 400);
  }

  return await get_hackathon_multi_project_status(hackathon_id);
};
