import { SupabaseClient } from "@/lib/supabase";

type TokenCategory =
  | "profile_completion"
  | "hackathon_join"
  | "project_submission"
  | "accept_project_invitation"
  | "post_hack_survey"
  | "project_technologies";

export class TokenService {
  protected supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getBalance(userId: string): Promise<number> {
    const { data } = await this.supabase
      .from("user_balances")
      .select("balance")
      .eq("user_id", userId)
      .single();

    return data?.balance || 0;
  }

  async getTransactionByRef(referenceId: string) {
    const { data, error } = await this.supabase
      .from("user_token_transactions")
      .select("*")
      .eq("reference_id", referenceId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const response = Array.isArray(data) ? (data[0] ?? null) : data;

    return response;
  }

  async getAllTransactions(userId: string) {
    const { data, error } = await this.supabase
      .from("user_token_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async awardTokens(opts: {
    userId: string;
    amount: number;
    category: TokenCategory;
    referenceId?: string;
    meta?: Record<string, any>;
    update?: boolean;
  }) {
    const { userId, amount, category, referenceId, meta, update } = opts;

    if (update) {
      const { error: upsertError, data } = await this.supabase
        .from("user_token_transactions")
        .upsert(
          {
            user_id: userId,
            category,
            reference_id: referenceId,
            amount,
            meta,
          },
          {
            onConflict: "user_id,reference_id",
          }
        );

      const res = await this.supabase.rpc("refresh_balance_for_user", {
        uid: userId,
      });
      console.log({ res });

      if (!upsertError) {
        return;
      }
    }

    // Otherwise insert new record
    const { error } = await this.supabase.from("user_token_transactions").insert({
      user_id: userId,
      amount,
      category,
      reference_id: referenceId,
      meta,
    });

    if (error) {
      console.error(error);
      // Postgres unique‐violation code is "23505"
      if (error.code === "23505") {
        return; // already awarded, nothing to do
      }
      throw error; // some other database error
    }

    // 2) Refresh the materialized view for this user only
    await this.supabase.rpc("refresh_balance_for_user", {
      uid: userId,
    });
  }
}
