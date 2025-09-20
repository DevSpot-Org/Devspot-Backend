import { ForbiddenError, handleError, UnauthorizedError } from "@/lib/errorHandler";
import { getSupabaseSession } from "./handleSession";

type AuthOptions = {
  requireUserId?: string;
};

export async function authGuard(options?: AuthOptions) {
  try {
    const { data, error } = await getSupabaseSession();

    if (error) throw error;

    if (!data.session) {
      throw new UnauthorizedError("Please log in");
    }

    const user = data.session.user;

    if (options?.requireUserId && options.requireUserId !== user.id) {
      throw new ForbiddenError("Not Owner of Resource");
    }

    return { user };
  } catch (error) {
    return handleError(error);
  }
}
