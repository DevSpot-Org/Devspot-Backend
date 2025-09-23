import { create_or_update_prize } from "@/lib/services/prizes";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  try {
    const technologyOwnerId = parseInt(params.id);
    const hackathonId = parseInt(params.hackathonId);

    if (isNaN(technologyOwnerId)) {
      return errorResponse("Invalid technology owner ID", 400);
    }

    if (isNaN(hackathonId)) {
      return errorResponse("Invalid hackathon ID", 400);
    }

    // Parse request body
    // const body = await request.json();
    const body = await request.formData();


    // Validate required fields
    // const requiredFields = ['challenge_id', 'title', 'company_partner_logo', 'rank'];
    // for (const field of requiredFields) {
    //   if (!body[field]) {
    //     return errorResponse(`Missing required field: ${field}`, 400);
    //   }
    // }

    // if (isNaN(body.challenge_id)) {
    //   return errorResponse("Invalid challenge_id: must be a number", 400);
    // }

    // if (isNaN(body.rank)) {
    //   return errorResponse("Invalid rank: must be a number", 400);
    // }

    // // Validate exactly one prize type is provided
    // const prizeTypes = [
    //   body.prize_usd !== null && body.prize_usd !== undefined,
    //   body.prize_tokens !== null && body.prize_tokens !== undefined,
    //   body.prize_custom !== null && body.prize_custom !== undefined
    // ].filter(Boolean);

    // if (prizeTypes.length === 0) {
    //   return errorResponse("Exactly one prize type (prize_usd, prize_tokens, or prize_custom) must be provided", 400);
    // }

    // if (prizeTypes.length > 1) {
    //   return errorResponse("Only one prize type (prize_usd, prize_tokens, or prize_custom) can be provided at a time", 400);
    // }

    // const prizeData = {
    //   id: body.id,
    //   challenge_id: body.challenge_id,
    //   title: body.title,
    //   company_partner_logo: body.company_partner_logo,
    //   rank: body.rank,
    //   prize_usd: body.prize_usd || null,
    //   prize_tokens: body.prize_tokens || null,
    //   prize_custom: body.prize_custom || null,
    // };

    return await create_or_update_prize(body, technologyOwnerId, hackathonId);
  } catch (error: any) {
    console.error("Error creating or updating prize:", error);
    return errorResponse(
      error?.message ?? "Failed to create or update prize",
      500
    );
  }
}; 