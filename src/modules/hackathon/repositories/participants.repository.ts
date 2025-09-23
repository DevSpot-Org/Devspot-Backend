import { SupabaseClient } from "@/lib/supabase";

interface ParticipantsRepositoryInterface {
  createTeamUpRequest(
    hackathon_id: number,
    participant_id: string,
    requester_id: string,
    action: string,
    message?: string
  ): Promise<any>;
  updateTeamUpStatus(
    hackathon_id: number,
    participant_id: string,
    requester_id: string,
    status: string
  ): Promise<any>;
  getTeamUpStatus(hackathon_id: number, participant_id: string, requester_id: string): Promise<any>;
  getHackathonParticipants(
    hackathon_id: number,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{ participants: any[]; total: number }>;
}

export class ParticipantsRepository implements ParticipantsRepositoryInterface {
  private teamUpTable = "project_team_members" as const;
  private participantsTable = "hackathon_participants" as const;

  constructor(private supabase: SupabaseClient) {}

  async createTeamUpRequest(
    hackathon_id: number,
    participant_id: string,
    requester_id: string,
    action: string,
    message?: string
  ): Promise<any> {
    // const { data, error } = await this.supabase
    //   .from(this.teamUpTable)
    //   .insert({
    //     hackathon_id,
    //     participant_id,
    //     requester_id,
    //     action,
    //     message,
    //     status: "pending",
    //   })
    //   .select()
    //   .single();

    // if (error) {
    //   throw new Error(`Failed to create team-up request: ${error.message}`);
    // }

    return {
      id: 0,
      status: true,
    };
  }

  async updateTeamUpStatus(
    hackathon_id: number,
    participant_id: string,
    requester_id: string,
    status: "pending" | "rejected" | "confirmed"
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.teamUpTable)
      .update({ status })
      .eq("hackathon_id", hackathon_id)
      .eq("participant_id", participant_id)
      .eq("requester_id", requester_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update team-up status: ${error.message}`);
    }

    return data;
  }

  async getTeamUpStatus(
    hackathon_id: number,
    participant_id: string,
    requester_id: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.teamUpTable)
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("participant_id", participant_id)
      .eq("requester_id", requester_id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get team-up status: ${error.message}`);
    }

    return data;
  }

  async getHackathonParticipants(
    hackathon_id: number,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ participants: any[]; total: number }> {
    let query = this.supabase
      .from(this.participantsTable)
      .select(
        `
        *,
        users(id, full_name, email, avatar_url, bio),
        hackathons(name)
      `,
        { count: "exact" }
      )
      .eq("hackathon_id", hackathon_id)
      .eq("status", "confirmed");

    if (search) {
      query = query.ilike("users.full_name", `%${search}%`);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon participants: ${error.message}`);
    }

    return {
      participants: data || [],
      total: count || 0,
    };
  }
}
