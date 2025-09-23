import { getWinnerAssignerChallengesController } from "@/modules/judging/controllers";
import { buildResponse } from "@/utils/buildResponse";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  const judging_id = parseInt(params.judgingId);

  if (!judging_id || isNaN(judging_id)) {
    return buildResponse({
      message: "Invalid Judging Id",
      data: null,
      isError: true,
      status: 400,
    });
  }

  return await getWinnerAssignerChallengesController(judging_id);
};
