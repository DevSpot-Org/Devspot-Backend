import { get_user_hackathons } from "@/lib/services/people";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { user_id: string } }) => {
  return await get_user_hackathons(params.user_id);
};
