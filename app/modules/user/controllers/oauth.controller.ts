import { getAuthenticatedUser } from "@/utils/auth-helpers";
import { buildResponse } from "@/utils/buildResponse";
import { getApexDomainServer } from "@/utils/host/host-server";
import { NextResponse } from "next/server";
import { connectDribbbleAccountService } from "../services/oauth.services";

export const connectDribbbleToOauthController = async () => {
  const dribbbleClientId = process.env.DRIBBLE_CLIENT_ID!;
  const redirectUri = `${await getApexDomainServer()}/api/auth/dribble/callback`;

  const state = crypto.randomUUID();
  const scope = "public";

  const params = new URLSearchParams({
    client_id: dribbbleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    state: state,
    scope: scope,
  });

  const authUrl = `https://dribbble.com/oauth/authorize?${params.toString()}`;

  return NextResponse.redirect(authUrl.toString());
};

export const connectDribbbleAccountController = async (
  code: string,
  requestUrl: string,
  state?: string | null
) => {
  const apexDomain = await getApexDomainServer();

  try {
    if (!code) {
      return buildResponse({
        data: null,
        message: "Missing authorization code",
        isError: true,
        status: 400,
      });
    }

    const { user, error: authError } = await getAuthenticatedUser();

    if (authError || !user) {
      return NextResponse.redirect(`/login?ref=${requestUrl}`);
    }

    const result = await connectDribbbleAccountService(user.id, code);

    if (state == "profile") {
      return NextResponse.redirect(`${apexDomain}/profile?success=true&provider=dribble`);
    } else if (state == "signup") {
      return NextResponse.redirect(
        `${apexDomain}/sign-up/connect-account?success=true&provider=dribble`
      );
    }

    return NextResponse.json({ accessToken: result?.tokenData?.access_token });
  } catch (err: unknown) {
    console.error("Dribble OAuth error:", err);

    if (state == "profile") {
      return NextResponse.redirect(`${apexDomain}/profile?success=true&provider=dribble`);
    } else if (state == "signup") {
      return NextResponse.redirect(
        `${apexDomain}/sign-up/connect-account?success=false&provider=dribble`
      );
    }
  }
};
