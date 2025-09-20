import { withAuth } from "@/modules/auth/utils";
import { connectDribbbleToOauthController } from "@/modules/user/controllers";

export const GET = withAuth(async () => {
  return await connectDribbbleToOauthController();
});
