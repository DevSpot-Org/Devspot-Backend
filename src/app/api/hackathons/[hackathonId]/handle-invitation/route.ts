import { handle_vip_invitation } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathon_id = parseInt(params.hackathonId);
  const search_params = request.nextUrl.searchParams;

  const handlerType = search_params.get("handler_type") as "approve" | "reject";
  const transactionId = search_params.get("transaction_id");

  if (!hackathon_id || isNaN(hackathon_id) || !handlerType || !transactionId) {
    return errorResponse("hackathon_id and handler_type are required", 400);
  }

  return await handle_vip_invitation(hackathon_id, handlerType, transactionId);
};
