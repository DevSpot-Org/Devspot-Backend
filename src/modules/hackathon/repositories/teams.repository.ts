import { SupabaseClient } from "@/lib/supabase";

interface TeamsRepositoryInterface {
  getAvailableTeammates(hackathon_id: number): Promise<any[]>;
  updateLookingForTeamStatus(
    hackathon_id: number,
    user_id: string,
    looking_for_team: boolean
  ): Promise<any>;
  getUserLookingForTeamStatus(hackathon_id: number, user_id: string): Promise<boolean>;
}

export class TeamsRepository implements TeamsRepositoryInterface {
  private participantsTable = "hackathon_participants" as const;

  constructor(private supabase: SupabaseClient) {}

  async getAvailableTeammates(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.participantsTable)
      .select(
        `
        *,
        users(id, full_name, email, avatar_url, bio, skills)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("status", "confirmed")
      .eq("looking_for_team", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch available teammates: ${error.message}`);
    }

    return data || [];
  }

  async updateLookingForTeamStatus(
    hackathon_id: number,
    user_id: string,
    looking_for_team: boolean
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.participantsTable)
      .update({
        looking_for_team,
        updated_at: new Date().toISOString(),
      })
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update looking for team status: ${error.message}`);
    }

    return data;
  }

  async getUserLookingForTeamStatus(hackathon_id: number, user_id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.participantsTable)
      .select("looking_for_teammates")
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id)
      .single();

    if (error) {
      throw new Error(`Failed to get looking for team status: ${error.message}`);
    }

    return data?.looking_for_teammates || false;
  }
}
