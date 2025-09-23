import { updateJudgingChallengesController } from "@/modules/judging/controllers/judging-challenges.controller";
import { getJudgingChallengesController } from "@/modules/judging/controllers/judging-management.controller";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  return await getJudgingChallengesController(params);
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string; judgingId: string } }
) => {
  const body = await request.json();

  return await updateJudgingChallengesController(body, params);
};
