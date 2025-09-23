import { get_auth_user_transactions } from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await get_auth_user_transactions();
};
