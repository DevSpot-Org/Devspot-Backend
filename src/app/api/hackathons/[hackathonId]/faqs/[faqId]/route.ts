import { NextRequest } from "next/server";

import { handle_click_hackathon_faq } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { faqId: string } }
) => {
  const faq_id = parseInt(params.faqId);

  if (!faq_id) return errorResponse("Invalid Faq Id", 400);

  return await handle_click_hackathon_faq(faq_id);
};
