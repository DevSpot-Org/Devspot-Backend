import { NextRequest } from "next/server";

import { handle_click_hackathon_resource } from "@/lib/services/hackathons";
import { errorResponse } from "@/utils/response-helpers";

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { resourceId: string } }
) => {
  const resource_id = parseInt(params.resourceId);

  if (!resource_id) return errorResponse("Invalid Resource Id", 400);

  return await handle_click_hackathon_resource(resource_id);
};
