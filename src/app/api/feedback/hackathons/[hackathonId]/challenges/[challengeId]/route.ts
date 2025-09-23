import {
  getFeedbackByChallengeController,
  submitHackathonFeedbackController,
  updateHackathonFeedbackController,
} from "@/modules/hackathon";
import { type NextRequest } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { hackathonId: string; challengeId: string } }
) => {
  return await getFeedbackByChallengeController(params);
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { hackathonId: string; challengeId: string } }
) => {
  const body = await req.json();

  return await submitHackathonFeedbackController(params, body);
};

export const PUT = async (
  req: NextRequest,
  { params }: { params: { hackathonId: string; challengeId: string } }
) => {
  const body = await req.json();

  return await updateHackathonFeedbackController(params, body);
};
