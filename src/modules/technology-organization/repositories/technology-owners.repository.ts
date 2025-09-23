import { SupabaseClient } from "@/lib/supabase";
import { TechnologyOwners } from "@/types/entities";
import { TechnologyOwnersRepositoryInterface } from "../types";

export class TechnologyOwnersRepository implements TechnologyOwnersRepositoryInterface {
  private table = "technology_owners" as const;

  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<TechnologyOwners | null> {
    const { data, error } = await this.supabase.from(this.table).select("*").eq("id", id).single();

    if (error) throw new Error(error.message);

    return data as TechnologyOwners | null;
  }

  async findByIdWithRelations(id: number): Promise<TechnologyOwners | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        technology_owner_users (
          *,
          users (*)
        ),
        hackathons!left (
          *,
          hackathon_participants(count)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    return data as any | null;
  }

  async findAll(): Promise<TechnologyOwners[]> {
    const { data, error } = await this.supabase.from(this.table).select(`
        *,
        hackathons!inner (
          id,
          start_date,
          registration_start_date
        )
      `);

    if (error) throw new Error(error.message);

    return (data as TechnologyOwners[]) || [];
  }

  async update(id: number, params: any): Promise<TechnologyOwners> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({
        description: params.description,
        discord_url: params.discord_url,
        domain: params.domain,
        facebook_url: params.facebook_url,
        instagram_url: params.instagram_url,
        link: params.link,
        linkedin_url: params.linkedin_url,
        location: params.location,
        logo: params.logo,
        name: params.name,
        num_employees: params.num_employees,
        slack_url: params.slack_url,
        tagline: params.tagline,
        technologies: params.technologies,
        telegram_url: params.telegram_url,
        x_url: params.x_url,
        youtube_url: params.youtube_url,
        banner_url: params.banner_url,
        company_industry: params.company_industry,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update technology owner: ${error.message}`);
    }

    return data;
  }

  async searchByName(searchTerm: string): Promise<TechnologyOwners[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .ilike("name", `%${searchTerm}%`);

    if (error) {
      throw new Error(`Failed to search technology owners: ${error.message}`);
    }

    if (!data) return [];

    const searchTermNormalized = searchTerm.toLowerCase().trim();
    const exactMatches = data.filter(
      (owner) => owner.name.toLowerCase().trim() === searchTermNormalized
    );

    return exactMatches;
  }
}
