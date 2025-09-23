import { NextRequest } from "next/server";
import { get_user_judgings } from "@/lib/services/judging";

export const GET = async (request: NextRequest, { params }: { params: { user_id: string } }) => {
  return await get_user_judgings(params.user_id);
};