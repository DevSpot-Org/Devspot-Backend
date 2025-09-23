import { createClient } from "@/lib/supabase";
import { NonceRepository, UsersRepository } from "@/modules/user/repositories";
import { buildResponse } from "@/utils/buildResponse";
import { getAuthenticatedUser } from "../utils";

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

export const deleteAccountController = async () => {
  try {
    const supabase = await createClient();

    const { user, error } = await getAuthenticatedUser();
    if (error || !user?.id) return error;

    const userService = new UsersRepository(supabase);
    await userService.deleteAccount(user?.id);

    return buildResponse({
      message: "Account deleted successfully",
      data: null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return buildResponse({
      message: error?.message ?? "Failed to delete user",
      data: err,
      isError: true,
      status: 400,
    });
  }
};
