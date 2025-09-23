import {
  get_all_participant_roles,
  update_participant_roles,
} from "@/lib/services/profile";
import { NextRequest } from "next/server";

export const GET = async () => {
  return await get_all_participant_roles();
};
export const PUT = async (request: NextRequest) => {
  const body = await request.json();

  return await update_participant_roles(body);
};
