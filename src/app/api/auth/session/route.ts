import { handleError, UnauthorizedError } from "@/lib/errorHandler";
import { getSupabaseSession } from "@/modules/auth/utils";

export async function GET() {
  try {
    const { data, error } = await getSupabaseSession();

    if (error) throw error;

    if (!data.session) throw new UnauthorizedError();

    return new Response(JSON.stringify({ session: data.session }), { status: 200 });
  } catch (error) {
    console.log(error, 'error')
    return handleError(error);
  }
}
