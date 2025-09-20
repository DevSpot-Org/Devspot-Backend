import { spotifyCallbackController } from "../../../../../modules/user/controllers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "profile";
  return spotifyCallbackController(code, request.url, state);
}
