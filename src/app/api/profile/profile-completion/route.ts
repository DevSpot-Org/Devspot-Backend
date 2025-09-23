import { get_profile_completion_percentage } from "@/lib/services/profile";

export const GET = async () => {
  return await get_profile_completion_percentage();
};
