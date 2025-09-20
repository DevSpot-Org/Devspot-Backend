import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized: Unable to fetch user ID" },
          { status: 401 }
        ),
      };
    }

    return {
      user,
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required. Please sign in to access this resource." },
        { status: 401 }
      ),
    };
  }
}
