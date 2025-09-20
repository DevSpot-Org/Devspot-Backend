import { unlinkUserIdentityController } from "@/modules/auth/controllers";
import { withAuth } from "@/modules/auth/utils";

export const POST = withAuth(async ({ req }) => {
  const body = await req.json();

  return unlinkUserIdentityController(body?.provider);
});
