import { getAuthenticatedUser } from "@/modules/auth/utils";
import { buildResponse } from "@/utils/buildResponse";
import { getApexDomainServer } from "@/utils/host/host-server";
import { NextResponse } from "next/server";
import { refreshSpotifyDataService, SpotifyService } from "../services";

export const connectSpotifyToOauthController = async (state: string) => {
  const spotifyClientId = process.env.SPOTIFY_CLIENT_ID!;
  const redirectUri = `${await getApexDomainServer()}/api/auth/spotify/callback`;

  const scope =
    "user-read-private user-read-email user-top-read user-read-currently-playing user-read-recently-played playlist-read-private";

  const params = new URLSearchParams({
    client_id: spotifyClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state,
    scope,
    show_dialog: "true",
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl.toString());
};

export const refreshSpotifyDataController = async (requestUrl: string) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.redirect(`/login?ref=${requestUrl}`);
    }

    const result = await refreshSpotifyDataService(user.id);

    return buildResponse({
      message: "Spotify data refreshed successfully",
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error refreshing Spotify data:", error);

    return buildResponse({
      message: error?.message ?? "Internal Server Error",
      data: null,
      isError: true,
      status: 500,
    });
  }
};

export const spotifyCallbackController = async (
  code: string | null,
  requestUrl: string,
  state?: string
) => {
  const apexDomain = await getApexDomainServer();
  const redirectUri = `${apexDomain}/api/auth/spotify/callback`;

  if (!code) {
    return NextResponse.redirect(
      `${apexDomain}/${
        state === "signup" ? "sign-up/connect-account" : "profile"
      }?success=false&provider=spotify&message=No code provided`
    );
  }

  try {
    const { access_token, refresh_token } = await SpotifyService.exchangeCodeForToken(
      code,
      redirectUri
    );

    if (!access_token || !refresh_token) {
      throw new Error("Invalid Spotify tokens");
    }

    await SpotifyService.storeRefreshToken(refresh_token);

    const { user, topTracks, currentlyPlaying, lastPlayedTrack } =
      await SpotifyService.fetchSpotifyUserData(access_token);

    const { error, user: authUser } = await getAuthenticatedUser();

    if (!authUser || error) {
      return NextResponse.redirect(`/login?ref=${requestUrl}`);
    }

    await SpotifyService.updateUserSpotifyData(authUser.id, {
      followers: user.followers.total,
      top_tracks: topTracks,
      playlist: user?.playlist,
      url: user?.external_urls?.spotify,
      currently_playing: currentlyPlaying,
      last_played_track: lastPlayedTrack,
    });

    return NextResponse.redirect(
      `${apexDomain}/${
        state === "signup" ? "sign-up/connect-account" : "profile"
      }?success=true&provider=spotify`
    );
  } catch (err) {
    console.error("Spotify OAuth error:", err);
    return NextResponse.redirect(
      `${apexDomain}/${
        state === "signup" ? "sign-up/connect-account" : "profile"
      }?success=false&provider=spotify`
    );
  }
};
