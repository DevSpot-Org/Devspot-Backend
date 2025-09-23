import { getChallengeJudgesForWinnerAssignmentController } from "@/modules/judging/controllers";
import { buildResponse } from "@/utils/buildResponse";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { judgingId: string; challengeId: string } }
) => {
  const judging_id = parseInt(params.judgingId);
  const challenge_id = parseInt(params.challengeId);

  if (!judging_id || isNaN(judging_id)) {
    return buildResponse({
      message: "Invalid Judging Id",
      data: null,
      isError: true,
      status: 400,
    });
  }
  if (!challenge_id || isNaN(challenge_id)) {
    return buildResponse({
      message: "Invalid Challenge Id",
      data: null,
      isError: true,
      status: 400,
    });
  }
  return await getChallengeJudgesForWinnerAssignmentController(judging_id, challenge_id);
};
