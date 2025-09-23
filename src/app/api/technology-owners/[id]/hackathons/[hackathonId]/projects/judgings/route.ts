import { NextRequest } from "next/server";
import { add_judges_to_projects, remove_judges_from_projects } from "@/lib/services/judging";
import { errorResponse } from "@/utils/response-helpers";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const { judging_project_challenge_pairs } = body;

  if (!Array.isArray(judging_project_challenge_pairs)) {
    return errorResponse("Invalid request body: judging_project_challenge_pairs missing or invalid", 400);
  }

  return await add_judges_to_projects(judging_project_challenge_pairs);
};

export const DELETE = async (request: NextRequest) => {
  const body = await request.json();
  const { judging_project_challenge_pairs } = body;

  if (!Array.isArray(judging_project_challenge_pairs)) {
    return errorResponse("Invalid request body: judging_project_challenge_pairs missing or invalid", 400);
  }

  return await remove_judges_from_projects(judging_project_challenge_pairs);
};
