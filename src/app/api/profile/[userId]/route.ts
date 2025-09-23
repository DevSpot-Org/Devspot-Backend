import { get_user_profile } from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  return await get_user_profile(params.userId);
};
