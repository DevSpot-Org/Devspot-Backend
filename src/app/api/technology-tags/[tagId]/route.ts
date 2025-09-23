import { update_tag_status } from "@/lib/services/utils/tagService";
import { type NextRequest } from "next/server";
export const PATCH = async (
  request: NextRequest,
  { params }: { params: { tagId: string } }
) => {
  const tagId = parseInt(params.tagId);
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (isNaN(tagId)) {
    return new Response(JSON.stringify({ error: "Invalid Tag ID" }), {
      status: 400,
    });
  }

  if (!status) {
    return new Response(
      JSON.stringify({ error: "Status parameter is required" }),
      {
        status: 400,
      }
    );
  }

  return await update_tag_status(tagId, status);
};
