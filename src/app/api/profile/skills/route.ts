import { get_skills_data } from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await get_skills_data();
};
