import { join_hackathon } from "@/lib/services/hackathons";
import { NextRequest } from "next/server";

export const POST = async (
  request: NextRequest,
  { params }: { params: { hackathonId: string } }
) => {
  const hackathonId = parseInt(params.hackathonId);
  if (isNaN(hackathonId)) {
    return new Response(JSON.stringify({ error: "Invalid hackathon ID" }), { status: 400 });
  }

  const body = await request.json();
  return await join_hackathon(hackathonId, body);
};
