import { type NextRequest } from "next/server";
import { authGuard } from "./authGuard";

type WithAuthContext = {
  req: NextRequest;
  params?: Record<string, string | string[]>;
  user: { id: string; [key: string]: any };
};

export function withAuth(handler: (ctx: WithAuthContext) => Promise<Response>) {
  return async (
    req: NextRequest,
    ctx: { params?: Record<string, string | string[]> }
  ): Promise<Response> => {
    const auth = await authGuard();

    if ("status" in auth) {
      return auth; // Unauthorized or Forbidden
    }

    return handler({
      req,
      params: ctx.params,
      user: auth.user,
    });
  };
}
