import { createClient } from "@/lib/supabase";
import crypto from "crypto";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { NonceRepository } from "../repositories/nonce.repository";
import { ParticipantWalletRepository } from "../repositories/wallet.repository";
import { BadRequestError, ServerError } from "@/lib/errorHandler";

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET!;

async function validateNonce(address: string, nonce: string, signature: string) {
  const supabase = await createClient();
  const nonceRepository = new NonceRepository(supabase);

  const nonceData = await nonceRepository.findValidNonce(address.toLocaleLowerCase(), nonce);

  if (!nonceData) throw new BadRequestError("Invalid or expired nonce");

  const recoveredAddress = ethers.verifyMessage(nonceData.nonce, signature);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new BadRequestError("Invalid signature");
  }

  return nonceData;
}

async function linkWalletToUser(userId: string, address: string) {
  const supabase = await createClient();
  const lowerCaseAddress = address.toLowerCase();
  const walletRepo = new ParticipantWalletRepository(supabase);
  const olderWallets = await walletRepo.findByUserId(userId);

  const data = await walletRepo.insertWallet({
    participant_id: userId,
    wallet_address: lowerCaseAddress,
    primary_wallet: !Boolean(olderWallets?.length),
  });

  return data;
}

async function createUserWithWallet(address: string) {
  const supabase = await createClient();
  const supabaseAdmin = await createClient({
    isAdmin: true,
  });
  const lowerCaseAddress = address.toLowerCase();

  const dummyEmail = `${lowerCaseAddress}@devspot.app`;
  const dummyPassword = crypto.randomBytes(16).toString("hex");

  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: dummyEmail,
    password: dummyPassword,
    email_confirm: true,
    user_metadata: {
      first_wallet: lowerCaseAddress,
      full_name: lowerCaseAddress.slice(-4),
    },
  });

  if (userError) throw new ServerError(`User creation failed: ${userError.message}`);

  const walletRepo = new ParticipantWalletRepository(supabase);

  await walletRepo.insertWallet({
    participant_id: userData.user.id,
    wallet_address: lowerCaseAddress,
    primary_wallet: true,
  });

  return userData.user.id;
}

function generateJwt(address: string, userId: string) {
  const payload = {
    email: `${address.toLowerCase()}@devspot.app`,
    sub: userId,
    aud: "authenticated",
    role: "authenticated",
    exp: Math.floor(Date.now() / 1000) + 3600,
    aal: "aal1",
    app_metadata: { provider: "wallet", providers: ["wallet"] },
    user_metadata: { first_wallet: address.toLowerCase() },
    confirmed_at: new Date().toISOString(),
  };

  return jwt.sign(payload, SUPABASE_JWT_SECRET, { algorithm: "HS256" });
}

async function consumeNonce(address: string) {
  const supabase = await createClient();
  const nonceRepository = new NonceRepository(supabase);

  await nonceRepository.markNonceAsUsed(address.toLocaleLowerCase());
}

export const WalletService = {
  validateNonce,
  linkWalletToUser,
  createUserWithWallet,
  generateJwt,
  consumeNonce,
};
