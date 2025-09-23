import { assignWinnerAssignerController } from "@/modules/judging/controllers";
import { buildResponse } from "@/utils/buildResponse";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { challengeId: string } }
) => {
  const challengeId = parseInt(params.challengeId);
  if (!challengeId || isNaN(challengeId)) {
    return buildResponse({
      message: "Invalid Challenge Id",
      data: null,
      isError: true,
      status: 400,
    });
  }

  const body = await request.json();
  const { judgeId, isWinnerAssigner } = body;

  if (!judgeId || typeof isWinnerAssigner !== "boolean") {
    return buildResponse({
      message: "Missing required fields: judgeId and isWinnerAssigner",
      data: null,
      isError: true,
      status: 400,
    });
  }

  return await assignWinnerAssignerController(challengeId, judgeId, isWinnerAssigner);
};
