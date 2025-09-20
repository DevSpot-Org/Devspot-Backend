import { SupabaseClient } from "@/lib/supabase";
import { Nonces } from "@/types/entities";

type NoncesInsert = {
  address: string;
  expires_at: string;
  nonce: string;
  used?: boolean;
};

interface NonceRepositoryInterface {
  findValidNonce(address: string, nonce: string): Promise<Nonces | null>;
  markNonceAsUsed(address: string): Promise<void>;
  insertNonce(insert: NoncesInsert): Promise<Nonces>;
}

export class NonceRepository implements NonceRepositoryInterface {
  private table = "nonces" as const;

  constructor(private supabase: SupabaseClient) {}

  async findValidNonce(address: string, nonce: string): Promise<Nonces | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("address", address.toLowerCase())
      .eq("nonce", nonce)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (error) throw error;
    return data as Nonces | null;
  }

  async markNonceAsUsed(address: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ used: true })
      .eq("address", address.toLowerCase());

    if (error) throw error;
  }

  async insertNonce(insert: NoncesInsert): Promise<Nonces> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert(insert)
      .select("*")
      .single();

    if (error) throw error;
    return data as Nonces;
  }
}
