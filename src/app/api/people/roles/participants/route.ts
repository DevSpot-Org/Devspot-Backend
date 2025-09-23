import { get_all_participant_roles } from "@/lib/services/profile";
import { type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return await get_all_participant_roles();
};
