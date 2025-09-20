import { createClient } from "@/lib/supabase";
import { ConnectedAccount, Spotify } from "@/types/profile";
import { cookies } from "next/headers";
import { UserProfileRepository } from "../repositories/profile.repository";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

async function getSpotifyAccessToken(refreshToken: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  const data = await response.json();
  return data.access_token;
}

export const refreshSpotifyDataService = async (userId: string) => {
  const supabase = await createClient();
  const cookiesList = await cookies();

  const refreshToken = cookiesList.get("spotify_refresh_token")?.value;
  if (!refreshToken) {
    throw new Error("No Spotify refresh token found");
  }

  const accessToken = await getSpotifyAccessToken(refreshToken);

  // Fetch currently playing
  const currentlyPlayingResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  let currentlyPlaying = null;
  if (currentlyPlayingResponse.status === 200) {
    const currentlyPlayingData = await currentlyPlayingResponse.json();
    currentlyPlaying = {
      name: currentlyPlayingData.item.name,
      artist: currentlyPlayingData.item.artists[0].name,
      album: currentlyPlayingData.item.album.name,
      id: currentlyPlayingData.item.id,
    };
  }

  // Fetch recently played
  const recentlyPlayedResponse = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  let lastPlayedTrack = null;
  if (recentlyPlayedResponse.ok) {
    const recentlyPlayedData = await recentlyPlayedResponse.json();
    if (recentlyPlayedData.items?.length > 0) {
      const track = recentlyPlayedData.items[0].track;
      lastPlayedTrack = {
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        id: track.id,
      };
    }
  }

  const userProfileRepo = new UserProfileRepository(supabase);

  const userData = await userProfileRepo.findByUserId(userId, ["connected_accounts"]);

  const connectedAccounts = (userData?.connected_accounts || []) as ConnectedAccount[];

  const existingIndex = connectedAccounts.findIndex((a) => "spotify" in a);
  const spotifyData = connectedAccounts.find((a): a is { spotify: Spotify } => "spotify" in a);

  if (!spotifyData) throw new Error("Spotify account missing");

  let dataChanged = false;

  if (
    JSON.stringify(currentlyPlaying) !== JSON.stringify(spotifyData.spotify?.currently_playing) ||
    JSON.stringify(lastPlayedTrack) !== JSON.stringify(spotifyData.spotify?.last_played_track)
  ) {
    dataChanged = true;
    connectedAccounts[existingIndex] = {
      spotify: {
        ...spotifyData.spotify,
        currently_playing: currentlyPlaying,
        last_played_track: lastPlayedTrack,
      },
    };

    await userProfileRepo.updateByUserId(userId, {
      connected_accounts: connectedAccounts,
    });
  }

  return {
    currently_playing: currentlyPlaying,
    last_played_track: lastPlayedTrack,
    data_changed: dataChanged,
  };
};

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) throw new Error("Failed to exchange code for token");

  return response.json();
}

async function fetchSpotifyUserData(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const [userRes, topTracksRes, currentRes, recentRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me", { headers }),
    fetch("https://api.spotify.com/v1/me/top/tracks?limit=5", { headers }),
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
    }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", {
      headers,
    }),
  ]);

  if (!userRes.ok) throw new Error("Failed to fetch Spotify user");
  if (!topTracksRes.ok) throw new Error("Failed to fetch top tracks");

  const user = await userRes.json();
  const topTracksData = await topTracksRes.json();

  let currentlyPlaying = null;
  if (currentRes.status === 200) {
    const currentData = await currentRes.json();
    currentlyPlaying = {
      name: currentData.item.name,
      artist: currentData.item.artists[0].name,
      album: currentData.item.album.name,
      id: currentData.item.id,
    };
  }

  let lastPlayedTrack = null;
  if (recentRes.ok) {
    const recentData = await recentRes.json();
    if (recentData.items?.length > 0) {
      const track = recentData.items[0].track;
      lastPlayedTrack = {
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        id: track.id,
      };
    }
  }

  return {
    user,
    topTracks: topTracksData.items.map((track: any) => ({
      name: track.name,
      artist: track.artists[0].name,
    })),
    currentlyPlaying,
    lastPlayedTrack,
  };
}

async function storeRefreshToken(refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("spotify_refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

async function updateUserSpotifyData(userId: string, spotifyData: Record<string, any>) {
  const supabase = await createClient();

  const userProfileRepo = new UserProfileRepository(supabase);

  const existing = await userProfileRepo.findByUserId(userId, ["connected_accounts"]);

  const connectedAccounts = (existing?.connected_accounts || []) as ConnectedAccount[];

  const existingIndex = connectedAccounts.findIndex((acc) => "spotify" in acc);

  if (existingIndex !== -1) {
    // @ts-ignore
    connectedAccounts[existingIndex] = { spotify: spotifyData };
  } else {
    // @ts-ignore
    connectedAccounts.push({ spotify: spotifyData });
  }

  await userProfileRepo.updateByUserId(userId, {
    connected_accounts: connectedAccounts,
  });
}

export const SpotifyService = {
  exchangeCodeForToken,
  fetchSpotifyUserData,
  storeRefreshToken,
  updateUserSpotifyData,
};
