import { SupabaseClient } from "@/lib/supabase";

interface CommunicationRepositoryInterface {
  getCommunicationLinks(hackathon_id: number): Promise<any[]>;
  getAnnouncements(hackathon_id: number): Promise<any[]>;
}

export class CommunicationRepository implements CommunicationRepositoryInterface {
  constructor(private supabase: SupabaseClient) {}

  async getCommunicationLinks(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_communication_links")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch communication links: ${error.message}`);
    }

    return data || [];
  }

  async getAnnouncements(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_announcements")
      .select("*")
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("platform_timestamp", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch announcements: ${error.message}`);
    }

    return data || [];
  }
}
