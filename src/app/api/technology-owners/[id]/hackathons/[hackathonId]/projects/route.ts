import { get_hackathon_projects } from "@/lib/services/hackathon";
import { delete_project_challenge_pairs } from "@/lib/services/judging";
import { errorResponse } from "@/utils/response-helpers";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  try {
    const hackathonId = parseInt(params.hackathonId);
    const technologyOwnerId = parseInt(params.id);

    if (isNaN(hackathonId)) {
      return Response.json(
        { data: null, error: "Invalid hackathon ID" },
        { status: 400 }
      );
    }

    if (isNaN(technologyOwnerId)) {
      return Response.json(
        { data: null, error: "Invalid technology owner ID" },
        { status: 400 }
      );
    }

    const projects = await get_hackathon_projects(hackathonId);
    return Response.json({ data: projects, error: null });
  } catch (error) {
    console.error("Error fetching hackathon projects:", error);
    return Response.json(
      { 
        data: null, 
        error: error instanceof Error ? error.message : "Failed to fetch hackathon projects",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: { id: string; hackathonId: string } }
) => {
  try {
    const hackathonId = parseInt(params.hackathonId);
    const technologyOwnerId = parseInt(params.id);

    if (isNaN(hackathonId)) {
      return errorResponse("Invalid hackathon ID", 400);
    }

    if (isNaN(technologyOwnerId)) {
      return errorResponse("Invalid technology owner ID", 400);
    }

    const body = await request.json();
    if (!body.pairs || !Array.isArray(body.pairs) || body.pairs.length === 0) {
      return errorResponse("Request body must include a non-empty array of pairs", 400);
    }

    // Validate that all items in the array are objects with projectId and challengeId as numbers
    if (!body.pairs.every((pair: any) => typeof pair.projectId === 'number' && !isNaN(pair.projectId) && typeof pair.challengeId === 'number' && !isNaN(pair.challengeId))) {
      return errorResponse("Each pair must have valid projectId and challengeId numbers", 400);
    }

    const result = await delete_project_challenge_pairs(hackathonId, body.pairs);
    return Response.json({ data: result, error: null });
  } catch (error: any) {
    console.error("Error deleting project-challenge pairs:", error);
    return errorResponse(error.message ?? "Failed to delete project-challenge pairs", 500);
  }
}; 