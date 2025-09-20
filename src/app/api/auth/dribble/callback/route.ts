import { connectDribbbleAccountController } from "@/modules/user/controllers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  return await connectDribbbleAccountController(code ?? "", request.url, state);
}
