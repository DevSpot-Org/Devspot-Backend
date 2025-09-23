import { SupabaseClient } from "@/lib/supabase";

interface DiscoveryRepositoryInterface {
  getDiscoverHackathons(): Promise<any[]>;
}

export class DiscoveryRepository implements DiscoveryRepositoryInterface {
  constructor(private supabase: SupabaseClient) {}

  async getDiscoverHackathons(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathons")
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_participants(user_id),
        hackathon_challenges(id, challenge_name)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathons: ${error.message}`);
    }

    return data || [];
  }
}
