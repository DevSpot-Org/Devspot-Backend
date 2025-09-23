import { SupabaseClient } from "@/lib/supabase";
import { HackathonChallenges } from "@/types/entities";

interface ChallengesRepositoryInterface {
  getHackathonChallenges(hackathon_id: number): Promise<any[]>;
  searchHackathonChallenges(
    hackathon_id: number,
    query: string,
    page?: number,
    limit?: number
  ): Promise<{ challenges: any[]; total: number }>;
}

export class ChallengesRepository implements ChallengesRepositoryInterface {
  private table = "hackathon_challenges" as const;

  constructor(private supabase: SupabaseClient) {}

  private buildSelect<T extends keyof HackathonChallenges>(fields?: T[]): string {
    return fields?.length ? fields.map((field) => this.toSnakeCase(String(field))).join(", ") : "*";
  }

  private toSnakeCase(field: string): string {
    return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  async findByHackathonId<T extends keyof HackathonChallenges>(
    id: number,
    fields?: T[]
  ): Promise<Pick<HackathonChallenges, T>[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .eq("hackathon_id", id);

    if (error) throw new Error(error.message);

    return data as unknown as Pick<HackathonChallenges, T>[];
  }

  async findById<T extends keyof HackathonChallenges>(
    id: number,
    fields?: T[]
  ): Promise<Pick<HackathonChallenges, T>> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(this.buildSelect(fields))
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data as unknown as Pick<HackathonChallenges, T>;
  }

  async getHackathonChallenges(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_challenge_prizes(*),
        project_challenges(project_id)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon challenges: ${error.message}`);
    }

    return data || [];
  }

  async searchHackathonChallenges(
    hackathon_id: number,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ challenges: any[]; total: number }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_challenge_prizes(*)
      `,
        { count: "exact" }
      )
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .or(`challenge_name.ilike.%${query}%,description.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search hackathon challenges: ${error.message}`);
    }

    return {
      challenges: data || [],
      total: count || 0,
    };
  }
}
