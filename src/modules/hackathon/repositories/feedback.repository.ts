import { SupabaseClient } from "@/lib/supabase";

interface FeedbackRepositoryInterface {
  createHackathonFeedback(
    hackathon_id: number,
    user_id: string,
    feedback: string,
    rating?: number
  ): Promise<any>;
  getHackathonFeedback(hackathon_id: number): Promise<any[]>;
}

export class FeedbackRepository implements FeedbackRepositoryInterface {
  private table = "global_hackathon_feedback" as const;

  constructor(private supabase: SupabaseClient) {}

  async createHackathonFeedback(
    hackathon_id: number,
    user_id: string,
    feedback: string,
    rating?: number
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("global_hackathon_feedback")
      .insert({
        hackathon_id,
        user_id,
        comments: feedback,
        overall_devspot_rating: 0,
        overall_hackathon_rating: 0,
        recommend_devspot_rating: 0,
        recommend_hackathon_rating: 0,
        // rating,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create hackathon feedback: ${error.message}`);
    }

    return data;
  }

  async getHackathonFeedback(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        users(id, full_name, avatar_url)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon feedback: ${error.message}`);
    }

    return data || [];
  }
}
