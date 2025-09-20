import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Unable to fetch user ID" },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { user, error: null };
}

export async function authenticateAndAuthorizeUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized: Unable to fetch user ID" },
        { status: 401 }
      ),
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
