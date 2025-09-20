import { config } from "@/lib/config";
import { getApexDomainServer } from "@/utils/host/host-server";
import { NextResponse } from "next/server";

const STACKOVERFLOW_CLIENT_ID = config.oauth.stackoverflow.clientId;

export async function GET(request: Request) {
  // Extract state from search params
  const state = new URL(request.url).searchParams.get("state");

  // Build OAuth URL parameters
  const params = new URLSearchParams({
    client_id: STACKOVERFLOW_CLIENT_ID,
    redirect_uri: `${await getApexDomainServer()}/api/auth/stackoverflow/callback`,
    scope: "read_inbox,private_info",
    state: state || "",
  });

  // Construct final auth URL
  const authUrl = `https://stackoverflow.com/oauth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
