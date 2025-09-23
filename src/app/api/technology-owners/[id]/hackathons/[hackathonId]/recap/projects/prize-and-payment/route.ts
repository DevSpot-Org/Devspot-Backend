import { getHackathonRecapProjectsPrizeAndPaymentController } from "@/modules/technology-organization/controllers/recap-projects.controller";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) {
  return getHackathonRecapProjectsPrizeAndPaymentController(params.id, params.hackathonId, request);
}
