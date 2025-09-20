import { Database } from "@/types/database";
import { getApexDomainServer } from "@/utils/host/host-server";
import { createServerClient } from "@supabase/ssr";
import { SupabaseClient as CustomSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const getUser = async () => {
  const auth = await createClient();
  const user = (await auth.auth.getUser()).data.user;

  return user;
};
export type SupabaseClient = CustomSupabaseClient<Database>;

export async function createClient(isAdmin?: boolean): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const key = isAdmin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.SUPABASE_ANON_KEY!;

  const supabase = createServerClient<Database, "public">(process.env.SUPABASE_URL!, key, {
    cookieOptions: {
      domain: process.env.APP_ENV === "local" ? ".localhost" : `.${await getApexDomainServer()}`, // Allow e.g. devspot.app and all subdomains (*.devspot.app)
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
