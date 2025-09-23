import { NextRequest } from "next/server";
import { submit_feedback } from "@/lib/services/user-feedback";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  return await submit_feedback(body);
};
