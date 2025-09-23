import { assignWinnersForChallengesController } from "@/modules/judging/controllers";
import { buildResponse } from "@/utils/buildResponse";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest, { params }: { params: { judgingId: string } }) => {
  const judging_id = parseInt(params.judgingId);

  if (!judging_id || isNaN(judging_id)) {
    return buildResponse({
      message: "Invalid Judging Id",
      data: null,
      isError: true,
      status: 400,
    });
  }
  const body = await request.json();
  return await assignWinnersForChallengesController(judging_id, body);
};
