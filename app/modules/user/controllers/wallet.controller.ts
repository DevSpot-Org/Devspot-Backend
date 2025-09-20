import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/utils/auth-helpers";
import { buildResponse } from "@/utils/buildResponse";
import { NextResponse } from "next/server";
import { WalletService } from "../services/wallet.service";

export const walletAuthController = async (req: Request) => {
  try {
    const body = await req.json();
    const { address, signature, nonce } = body;

    if (!address || !signature || !nonce) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await WalletService.validateNonce(address, nonce, signature);
    const { user } = await getAuthenticatedUser();
    const supabase = await createClient();

    let userId: string;

    // check if wallet already exists
    const { data: walletData } = await supabase
      .from("participant_wallets")
      .select("participant_id")
      .eq("wallet_address", address.toLowerCase())
      .single();

    if (user?.id && walletData) {
      const isOwner = user.id === walletData.participant_id;
      return NextResponse.json(
        {
          error: isOwner ? "You already have this wallet linked" : "Wallet already linked",
        },
        { status: 401 }
      );
    }

    if (user?.id) {
      await WalletService.linkWalletToUser(user.id, address);
      userId = user.id;
    } else if (walletData && walletData?.participant_id) {
      userId = walletData?.participant_id;
    } else {
      userId = await WalletService.createUserWithWallet(address);
    }

    const token = WalletService.generateJwt(address, userId);
    await WalletService.consumeNonce(address);

    const { data: authData, error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: token,
    });
    if (error || !authData) throw new Error(`Could not generate session: ${error?.message}`);

    const { data: roles } = await supabase
      .from("user_participant_roles")
      .select("*")
      .eq("participant_id", authData?.user?.id!);

    const { origin } = new URL(req.url);
    if (!roles?.length) {
      return NextResponse.json({
        url: `${origin}/en/sign-up/participants/select-location`,
      });
    }

    return buildResponse({
      message: "Wallet Connected Successfully",
      data: {
        url: `${origin}/en`,
      },
    });
  } catch (err: any) {
    return buildResponse({
      message: err?.message ?? "Failed to connect wallet",
      data: err,
      isError: true,
    });
  }
};
