import { UnauthorizedError } from "@/lib/errorHandler";
import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function getSupabaseSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    throw new UnauthorizedError("No access token found");
  }

  const supabase = await createClient();

  return await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

export async function getAuthenticatedUser() {
  const { data, error } = await getSupabaseSession();

  return { user: data.user, error };
}
