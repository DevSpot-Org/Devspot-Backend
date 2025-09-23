import { get_user_token_balance } from "@/lib/services/profile";

export const GET = async () => {
  return await get_user_token_balance();
};
