
import { uploadImage } from "@/utils/uploadImage";
import { PartnerPayload } from "../types";
import { SupabaseClient } from "@/lib/supabase";

interface MiscRepositoryInterface {
  getHackathonOverview(hackathon_id: number): Promise<any>;
  joinHackathon(
    hackathon_id: number,
    user_id: string,
    email?: string
  ): Promise<any>;
  leaveHackathon(hackathon_id: number, user_id: string): Promise<void>;
  searchJudges(hackathon_id: number, query: string): Promise<any[]>;
  getLeaderboard(hackathon_id: number): Promise<any[]>;
  getSponsors(hackathon_id: number): Promise<any[]>;
  createStakeTransaction(
    hackathon_id: number,
    user_id: string,
    amount: number
  ): Promise<any>;
  toggleJudgeStatus(
    hackathon_id: number,
    user_id: string,
    is_judge: boolean
  ): Promise<any>;
  toggleMultiProjects(
    hackathon_id: number,
    allow_multiple_projects: boolean
  ): Promise<any>;
  getVips(hackathon_id: number): Promise<any[]>;
  handleInvitation(
    hackathon_id: number,
    user_id: string,
    invitation_id: number,
    action: string
  ): Promise<void>;
  getHackathon(hackathon_id: number): Promise<any>;
  upsertPartner(data: PartnerPayload[], hackathon_id: number): Promise<any>;
}

export class MiscRepository implements MiscRepositoryInterface {
  constructor(private supabase: SupabaseClient) {}

  async getHackathonOverview(hackathon_id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathons")
      .select(
        `
        *,
        technology_owners(name, logo_url),
        hackathon_participants(user_id),
        hackathon_challenges(id, challenge_name),
        hackathon_sponsors(*),
        hackathon_vips(*)
      `
      )
      .eq("id", hackathon_id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon overview: ${error.message}`);
    }

    return data;
  }

  async joinHackathon(
    hackathon_id: number,
    user_id: string,
    email?: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .insert({
        hackathon_id,
        user_id,
        status: "confirmed",
        email,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to join hackathon: ${error.message}`);
    }

    return data;
  }

  async leaveHackathon(hackathon_id: number, user_id: string): Promise<void> {
    const { error } = await this.supabase
      .from("hackathon_participants")
      .delete()
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id);

    if (error) {
      throw new Error(`Failed to leave hackathon: ${error.message}`);
    }
  }

  async searchJudges(hackathon_id: number, query: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .select(
        `
        *,
        users(id, full_name, avatar_url)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("is_judge", true)
      .eq("status", "confirmed")
      .ilike("users.full_name", `%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search judges: ${error.message}`);
    }

    return data || [];
  }

  async getLeaderboard(hackathon_id: number): Promise<any[]> {
    return [];
  }

  async getSponsors(hackathon_id: number): Promise<any[]> {
    return [];
  }

  async createStakeTransaction(
    hackathon_id: number,
    user_id: string,
    amount: number
  ): Promise<any> {
    return null;
  }

  async toggleJudgeStatus(
    hackathon_id: number,
    user_id: string,
    is_judge: boolean
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathon_participants")
      .update({
        is_judge,
        updated_at: new Date().toISOString(),
      })
      .eq("hackathon_id", hackathon_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle judge status: ${error.message}`);
    }

    return data;
  }

  async toggleMultiProjects(
    hackathon_id: number,
    allow_multiple_projects: boolean
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathons")
      .update({
        allow_multiple_projects,
        updated_at: new Date().toISOString(),
      })
      .eq("id", hackathon_id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle multiple projects: ${error.message}`);
    }

    return data;
  }

  async getVips(hackathon_id: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("hackathon_vips")
      .select(
        `
        *,
        users(id, full_name, avatar_url)
      `
      )
      .eq("hackathon_id", hackathon_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch VIPs: ${error.message}`);
    }

    return data || [];
  }

  async handleInvitation(
    hackathon_id: number,
    user_id: string,
    invitation_id: number,
    action: string
  ): Promise<void> {
    const status = action === "accept" ? "accepted" : "declined";
  }

  async getHackathon(hackathon_id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from("hackathons")
      .select(
        `
        *,
        technology_owners(name, logo_url, bio),
        hackathon_participants(user_id, status),
        hackathon_challenges(id, challenge_name),
        hackathon_sponsors(*),
        hackathon_vips(*)
      `
      )
      .eq("id", hackathon_id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch hackathon: ${error.message}`);
    }

    return data;
  }

  async upsertPartner(
    data: PartnerPayload[],
    hackathon_id: number
  ): Promise<any> {
    const results = [];

    for (const partner of data) {
      let finalLogoUrl = partner.logo_url;

      // Handle file upload if logo_url is a File
      if (partner.logo_url instanceof File) {
        const { publicUrl, error: uploadError } = await uploadImage({
          file: partner.logo_url,
          userId: hackathon_id.toString(),
          bucketName: "hackathon-images",
          folderPath: "community-partners",
        });

        if (uploadError) {
          throw new Error(`Failed to upload logo: ${uploadError}`);
        }

        finalLogoUrl = publicUrl;
      }

      // Update or insert partner
      const { data: updatedPartner, error } = await this.supabase
        .from("hackathon_community_partners")
        .upsert({
          id: parseInt(partner.id) || undefined,
          hackathon_id: hackathon_id,
          partner_website: partner.partner_website,
          logo_url: finalLogoUrl as string,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update community partner: ${error.message}`);
      }

      results.push(updatedPartner);
    }

    return results;
  }
}
