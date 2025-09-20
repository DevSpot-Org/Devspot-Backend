import { config } from "@/lib/config";
import { createClient } from "@/lib/supabase";
import { ConnectedAccount } from "@/types/profile";
import { getApexDomainServer } from "@/utils/host/host-server";
import { NextResponse } from "next/server";

const STACKOVERFLOW_CLIENT_ID = config.oauth.stackoverflow.clientId;
const STACKOVERFLOW_CLIENT_SECRET = config.oauth.stackoverflow.clientSecret;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createClient();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const apexDomain = await getApexDomainServer();
  const STACKOVERFLOW_REDIRECT_URI = `${apexDomain}/api/auth/stackoverflow/callback`;

  if (!code) {
    return NextResponse.redirect(`${apexDomain}/profile`);
  }
  const {
    data: { user },
    error: fetchUserError,
  } = await supabase.auth.getUser();

  if (!user || fetchUserError) {
    return NextResponse.redirect(`/login?ref=${request.url}`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://stackoverflow.com/oauth/access_token/json", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: STACKOVERFLOW_CLIENT_ID,
        client_secret: STACKOVERFLOW_CLIENT_SECRET,
        code,
        redirect_uri: STACKOVERFLOW_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData?.access_token;

    if (!accessToken) {
      throw new Error("No access token received");
    }

    // Fetch user data
    const userReputation = await fetch(
      `https://api.stackexchange.com/2.3/me?site=stackoverflow&key=${process.env.STACKOVERFLOW_API_KEY}&access_token=${accessToken}&filter=!*Mg4PjfXdyMcuySE`
    );
    if (!userReputation.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await userReputation.json();
    const userInfo = userData.items[0];

    const stackOverflowData = {
      reputation: userInfo?.reputation,
      upvote: userInfo?.up_vote_count,
      answers: userInfo?.answer_count,
      questions: userInfo?.question_count,
      url: userInfo?.link,
    };

    // Store the Stack Overflow data in Supabase
    const supabase = await createClient();

    const { data: existingData, error: fetchError } = await supabase
      .from("participant_profile")
      .select("connected_accounts")
      .eq("participant_id", user?.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const connectedAccounts = (existingData?.connected_accounts || []) as ConnectedAccount[];
    const existingAccountIndex = connectedAccounts.findIndex(
      (account) => "stack_overflow" in account
    );

    if (existingAccountIndex !== -1) {
      // @ts-ignore
      connectedAccounts[existingAccountIndex] = {
        stack_overflow: stackOverflowData,
      };
    } else {
      // @ts-ignore
      connectedAccounts.push({ stack_overflow: stackOverflowData });
    }

    const { data, error: updateError } = await supabase
      .from("participant_profile")
      .update({ connected_accounts: connectedAccounts })
      .eq("participant_id", user?.id);

    if (updateError) throw updateError;

    // Redirect back to the connected accounts page
    if (state == "profile") {
      return NextResponse.redirect(`${apexDomain}/profile?success=true&provider=stackoverflow`);
    } else if (state == "signup") {
      return NextResponse.redirect(
        `${apexDomain}/sign-up/connect-account?success=true&provider=stackoverflow`
      );
    }
  } catch (error) {
    console.error("Stack Overflow OAuth error:", error);
    if (state == "profile") {
      return NextResponse.redirect(`${apexDomain}/profile?success=true&provider=stackoverflow`);
    } else if (state == "signup") {
      return NextResponse.redirect(
        `${apexDomain}/sign-up/connect-account?success=false&provider=spotify`
      );
    }
  }
}
