import { walletAuthController } from "@/modules/user/controllers";

export async function POST(req: Request) {
  return await walletAuthController(req);
}
