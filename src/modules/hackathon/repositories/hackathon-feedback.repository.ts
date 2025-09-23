import { SupabaseClient } from "@/lib/supabase";

export default class HackathonFeedbackRepository {
  private table = "hackathon_participants" as const;

  constructor(private supabase: SupabaseClient) {}

  async getFeedbackByChallenge(hackathonId: number, challengeId: number) {
    return this.supabase
      .from(this.table)
      .select("*")
      .eq("hackathon_id", hackathonId)
      .eq("challenge_id", challengeId);
  }

  async createFeedbackForChallenge(payload: {
    hackathon_id: number;
    challenge_id: number;
    project_id: number;
    overall_rating: number;
    docs_rating: number;
    support_rating: number;
    comments?: string;
  }) {
    return this.supabase.from(this.table).insert(payload).select().single();
  }

  async updateFeedbackForChallenge(
    hackathon_id: number,
    challenge_id: number,
    project_id: number,
    updates: Record<string, any>
  ) {
    return this.supabase
      .from(this.table)
      .update(updates)
      .eq("hackathon_id", hackathon_id)
      .eq("challenge_id", challenge_id)
      .eq("project_id", project_id)
      .select()
      .single();
  }
}
