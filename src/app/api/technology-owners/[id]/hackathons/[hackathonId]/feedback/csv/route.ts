import { get_hackathon_feedback_csv } from "@/lib/services/technology_owner";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
    console.log({params})
  const hackathonId = parseInt(params.hackathonId);

  if (isNaN(hackathonId)) {
    return errorResponse("Invalid hackathon ID", 400);
  }

  const hackathon_id = parseInt(params.hackathonId);

  if (!hackathon_id) return errorResponse("Invalid Hackathon Id", 400);
  const data = await get_hackathon_feedback_csv(hackathon_id);

    return new Response(data.content, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${data.name}.csv"`,
      },
    });
};
