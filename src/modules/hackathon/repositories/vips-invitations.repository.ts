import { SupabaseClient } from "@/lib/supabase";

export class HackathonVipInvitationsRepository {
  private table = "hackathon_vips_invitations" as const;

  constructor(private supabase: SupabaseClient) {}

  async deleteInvite(hackathonId: number, identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    return this.supabase
      .from(this.table)
      .delete()
      .eq("hackathon_id", hackathonId)
      .eq(isUUID ? "user_id" : "email", identifier);
  }

  async findInvitation(hackathonId: number, identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    return this.supabase
      .from(this.table)
      .select("*, status, hackathons(name), users(*)")
      .eq("hackathon_id", hackathonId)
      .eq(isUUID ? "user_id" : "email", identifier)
      .maybeSingle();
  }

  async updateInvitation(id: number, payload: any, transactionId: string) {
    return this.supabase
      .from(this.table)
      .update({
        transaction_id: transactionId,
        payload,
      })
      .eq("id", id)
      .select()
      .single();
  }
}
