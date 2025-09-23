import { SupabaseClient } from "@/lib/supabase";

export class HackathonChallengeFeedbackRepository {
  private supabase: SupabaseClient;
  private table = "hackathon_challenge_feedback" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Get user feedback for a specific hackathon
  async getUserFeedbackByHackathon(hackathonId: number, userId: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("challenge_id")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch user feedback: ${error.message}`);
    }

    return data || [];
  }
}
