import { sign_user_terms_of_acceptance } from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  return await sign_user_terms_of_acceptance();
};
