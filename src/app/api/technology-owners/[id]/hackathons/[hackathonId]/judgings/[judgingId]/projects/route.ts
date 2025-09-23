import {
  addJudgeToProjectsController,
  getProjectsAJudgeIsJudgingController,
  removeJudgeFromProjectsController,
} from "@/modules/judging/controllers/judging-management.controller";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  const judging_id = parseInt(params.judgingId);

  if (!judging_id || isNaN(judging_id)) {
    return errorResponse("Invalid Judging Id", 400);
  }
  return await getProjectsAJudgeIsJudgingController(judging_id);
};

export const POST = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  const body = await request.json();

  return await addJudgeToProjectsController(body, params);
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { judgingId: string } }
) => {
  const body = await request.json();

  return await removeJudgeFromProjectsController(body, params);
};
