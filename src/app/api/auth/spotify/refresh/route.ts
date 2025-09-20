import { refreshSpotifyDataController } from "../../../../../modules/user/controllers";

export async function GET(request: Request) {
  return await refreshSpotifyDataController(request.url);
}
