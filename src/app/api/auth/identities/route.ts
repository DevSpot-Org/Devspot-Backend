import { getUserIdentitiesController } from "@/modules/auth/controllers";
import { withAuth } from "@/modules/auth/utils";

export const GET = withAuth(async () => {
  return await getUserIdentitiesController();
});
