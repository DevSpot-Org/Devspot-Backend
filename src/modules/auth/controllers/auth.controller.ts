import { createClient } from "@/lib/supabase";
import { NonceRepository } from "@/modules/user/repositories";
import { buildResponse } from "@/utils/buildResponse";
import { signInService } from "../services";
import { signInValidator } from "../validators";

export const generateNonceController = async (walletAddress: string) => {
  try {
    const supabase = await createClient();

    const nonce = [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

    const nonceRepository = new NonceRepository(supabase);

    await nonceRepository.insertNonce({
      address: walletAddress.toLowerCase(),
      nonce,
      used: false,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    });

    return buildResponse({
      data: nonce,
      message: "Nonce Generated Successfully",
    });
  } catch (err: unknown) {
    const error = err as Error;

    return buildResponse({
      message: error?.message ?? "Failed to generate nonce",
      data: err,
      isError: true,
    });
  }
};

export const signInController = async (body: any) => {
  try {
    await signInValidator.validate(body);
    const data = await signInService(body.email, body.password);

    const { session } = data;

    const res = buildResponse({ data, message: "Signin successful" });

    if (session) {
      res.cookies.set("sb-access-token", session.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60,
      });
      res.cookies.set("sb-refresh-token", session.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return res;
  } catch (err: any) {
    return buildResponse({ isError: true, message: err.message, data: err });
  }
};
