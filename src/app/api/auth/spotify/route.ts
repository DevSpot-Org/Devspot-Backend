import { connectSpotifyToOauthController } from "../../../../modules/user/controllers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || "profile";

  return await connectSpotifyToOauthController(state);
}
