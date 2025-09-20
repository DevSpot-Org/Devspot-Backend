import { SupabaseClient } from "@/lib/supabase";
import { ParticipantWallets } from "@/types/entities";

interface ParticipantWalletRepositoryInterface {
  findByUserId(userId: string): Promise<ParticipantWallets[]>;
  insertWallet(insert: ParticipantWalletInsert): Promise<ParticipantWallets>;
  setPrimaryWallet(userId: string, walletId: number): Promise<void>;
}

export type ParticipantWalletInsert = {
  network?: string | null;
  participant_id?: string | null;
  primary_wallet?: boolean;
  wallet_address: string;
};

export class ParticipantWalletRepository implements ParticipantWalletRepositoryInterface {
  private table = "participant_wallets" as const;

  constructor(private supabase: SupabaseClient) {}

  async findByUserId(userId: string): Promise<ParticipantWallets[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("participant_id", userId);

    if (error) throw error;
    return (data ?? []) as ParticipantWallets[];
  }

  async insertWallet(insert: ParticipantWalletInsert): Promise<ParticipantWallets> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert(insert)
      .select("*")
      .single();

    if (error) throw error;
    return data as ParticipantWallets;
  }

  async setPrimaryWallet(userId: string, walletId: number): Promise<void> {
    // Reset all to false
    const { error: resetError } = await this.supabase
      .from(this.table)
      .update({ primary_wallet: false })
      .eq("participant_id", userId);

    if (resetError) throw resetError;

    // Set chosen one to true
    const { error: updateError } = await this.supabase
      .from(this.table)
      .update({ primary_wallet: true })
      .eq("id", walletId)
      .eq("participant_id", userId);

    if (updateError) throw updateError;
  }
}
