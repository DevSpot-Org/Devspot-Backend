import { SupabaseClient } from "@/lib/supabase";

interface PrizesRepositoryInterface {
  getHackathonPrizes(hackathon_id: number): Promise<any[]>;
}

export class PrizesRepository implements PrizesRepositoryInterface {
  constructor(private supabase: SupabaseClient) {}

  async getHackathonPrizes(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_challenge_bounties")
      .select(
        `
        *,
        hackathon_challenges(
          id,
          challenge_name,
          technology_owners(name, logo_url)
        )
      `
      )
      .eq("hackathon_challenges.hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("prize_amount", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon prizes: ${error.message}`);
    }

    return data || [];
  }
}
