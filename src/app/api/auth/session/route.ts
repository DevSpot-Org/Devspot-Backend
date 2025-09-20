import { handleError } from "@/lib/errorHandler";
import { getSupabaseSession } from "@/modules/auth/utils";

export async function GET() {
  const { data, error } = await getSupabaseSession();

  if (error) {
    return handleError(error);
  }

  if (!data.session) {
    return new Response(JSON.stringify({ session: null }), { status: 401 });
  }

  return new Response(JSON.stringify({ session: data.session }), { status: 200 });
}
