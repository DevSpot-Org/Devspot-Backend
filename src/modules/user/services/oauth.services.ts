import { BadRequestError } from "@/lib/errorHandler";
import { createClient } from "@/lib/supabase";
import { ConnectedAccount } from "@/types/profile";
import { getApexDomainServer } from "@/utils/host/host-server";
import { UserProfileRepository } from "../repositories";

export const connectDribbbleAccountService = async (userId: string, code: string) => {
  const supabase = await createClient();
  const apexDomain = await getApexDomainServer();

  const clientId = process.env.DRIBBLE_CLIENT_ID!;
  const clientSecret = process.env.DRIBBLE_CLIENT_SECRET!;
  const tokenUrl = "https://dribbble.com/oauth/token";
  const redirectUri = `${apexDomain}/api/auth/dribble/callback`;

  // Exchange code for token
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await response.json();
  if (!response.ok || !tokenData?.access_token) {
    throw new BadRequestError("Failed to retrieve Dribbble access token");
  }

  const accessToken = tokenData.access_token;

  // Fetch Dribbble user data
  const userRes = await fetch(`https://api.dribbble.com/v2/user?access_token=${accessToken}`);
  if (!userRes.ok) throw new Error("Failed to fetch Dribbble user data");
  const userData = await userRes.json();

  // Fetch Dribbble shots
  const shotsRes = await fetch(
    `https://api.dribbble.com/v2/user/shots?access_token=${accessToken}`
  );
  const shotsData = shotsRes.ok ? await shotsRes.json() : [];

  // Prepare connected account payload
  const dribbbleData = {
    followers: userData?.followers_count ?? 0,
    liked_shots: 0, // update if needed
    shots: shotsData?.length ?? 0,
    url: userData?.html_url ?? "",
  };

  const userProfileRepo = new UserProfileRepository(supabase);

  const existing = await userProfileRepo.findByUserId(userId, ["connected_accounts"]);

  const connectedAccounts = (existing?.connected_accounts || []) as ConnectedAccount[];

  const idx = connectedAccounts.findIndex((acc) => "dribble" in acc);
  if (idx !== -1) {
    // @ts-ignore
    connectedAccounts[idx] = { dribble: dribbbleData };
  } else {
    // @ts-ignore
    connectedAccounts.push({ dribble: dribbbleData });
  }

  await userProfileRepo.updateByUserId(userId, {
    connected_accounts: connectedAccounts,
  });

  return { dribbble: dribbbleData, tokenData };
};
