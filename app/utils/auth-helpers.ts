import { createClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  const refreshToken = cookieStore.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    throw new Error("No access token found");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;

  return { user: data.user, error: null };
}

export async function authenticateAndAuthorizeUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized: Unable to fetch user ID" }, { status: 401 }),
      user: null,
    };
  }

  if (user.id !== userId) {
    return {
      error: NextResponse.json(
        { error: "Forbidden: You can only access your own data" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { user, error: null };
}
