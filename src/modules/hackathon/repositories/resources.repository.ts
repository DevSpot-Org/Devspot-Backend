import { SupabaseClient } from "@/lib/supabase";

interface ResourcesRepositoryInterface {
  getHackathonResources(hackathon_id: number): Promise<any[]>;
  getHackathonResource(hackathon_id: number, resource_id: number): Promise<any>;
}

export class ResourcesRepository implements ResourcesRepositoryInterface {
  private table = "hackathon_resources" as const;

  constructor(private supabase: SupabaseClient) {}

  async getHackathonResources(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch hackathon resources: ${error.message}`);
    }

    return data || [];
  }

  async getHackathonResource(hackathon_id: number, resource_id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("id", resource_id)
      .eq("is_active", true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon resource: ${error.message}`);
    }

    return data;
  }
}
