import { SupabaseClient } from "@/lib/supabase";

interface GlobalRepositoryInterface {
  searchHackathons(
    query: string,
    page?: number,
    limit?: number
  ): Promise<{ hackathons: any[]; total: number }>;
  getHackathons(
    page?: number,
    limit?: number,
    status?: string
  ): Promise<{ hackathons: any[]; total: number }>;
  getUserHackathons(user_id: string): Promise<any[]>;
}

export class GlobalRepository implements GlobalRepositoryInterface {
  private table = "hackathons" as const;

  constructor(private supabase: SupabaseClient) {}

  async searchHackathons(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ hackathons: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_participants(user_id),
        hackathon_challenges(id, challenge_name)
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search hackathons: ${error.message}`);
    }

    return {
      hackathons: data || [],
      total: count || 0,
    };
  }

  async getHackathons(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{ hackathons: any[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = this.supabase
      .from(this.table)
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_participants(user_id),
        hackathon_challenges(id, challenge_name)
      `,
        { count: "exact" }
      )
      .eq("is_active", true);

    if (status && status !== "all") {
      const now = new Date().toISOString();
      switch (status) {
        case "active":
          query = query.lte("start_date", now).gte("end_date", now);
          break;
        case "upcoming":
          query = query.gt("start_date", now);
          break;
        case "past":
          query = query.lt("end_date", now);
          break;
      }
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathons: ${error.message}`);
    }

    return {
      hackathons: data || [],
      total: count || 0,
    };
  }

  async getUserHackathons(user_id: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        *,
        hackathons(
          *,
          technology_owners(name, logo_url)
        )
      `
      )
      .eq("user_id", user_id)
      .in("status", ["confirmed", "pending"])
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user hackathons: ${error.message}`);
    }

    return data || [];
  }
}
