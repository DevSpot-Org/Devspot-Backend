import { createServerClient } from "@supabase/ssr";
import { SupabaseClient as CustomSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "../types/database";
import { getApexDomainServer } from "../utils/host/host-server";
import { config } from "./config";

export type SupabaseClient = CustomSupabaseClient<Database>;

interface CreateSupabaseClientOptions {
  isAdmin: boolean;
}

export async function createClient(
  options?: Partial<CreateSupabaseClientOptions>
): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const key = options?.isAdmin ? config.supabase.serviceRoleKey : config.supabase.anonKey;

  const supabase = createServerClient<Database, "public">(config.supabase.url, key, {
    cookieOptions: {
      // Allow e.g. devspot.app and all subdomains (*.devspot.app)
      domain: process.env.APP_ENV === "local" ? ".localhost" : `.${await getApexDomainServer()}`,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  return supabase as unknown as SupabaseClient;
}
