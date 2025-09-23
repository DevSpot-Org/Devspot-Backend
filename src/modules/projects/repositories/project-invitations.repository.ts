import { SupabaseClient } from "@/lib/supabase";
import { ProjectInvitationsRepositoryInterface } from "../types";

export class ProjectInvitationsRepository implements ProjectInvitationsRepositoryInterface {
  private supabase: SupabaseClient;
  private table = "project_invitations" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createInvitation(projectId: number, userId: string, role: string = "member"): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        project_id: projectId,
        user_id: userId,
        status: "pending",
        type: "invite",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invitation: ${error.message}`);
    }

    return data;
  }

  async updateInvitationStatus(invitationId: number, status: any): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", invitationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update invitation status: ${error.message}`);
    }

    return data;
  }

  async findInvitationById(invitationId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", invitationId)
      .single();

    if (error) {
      console.error("Error finding invitation by ID:", error);
      return null;
    }

    return data;
  }

  async findInvitationByProjectAndUser(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error finding invitation by project and user:", error);
      return null;
    }

    return data;
  }

  async findInvitationByProjectAndEmail(projectId: number, email: string): Promise<any> {
    // This table doesn't support email invitations, so return null
    return null;
  }

  async findInvitationsByProjectId(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        id,
        user_id,
        status,
        type,
        created_at,
        updated_at
      `
      )
      .eq("project_id", projectId);

    if (error) {
      console.error("Error finding invitations by project ID:", error);
      return [];
    }

    return data || [];
  }

  // Check if invitation already exists for user and project
  async checkExistingInvitation(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (error) {
      throw new Error(`Failed to check existing invitation: ${error.message}`);
    }

    return data;
  }

  // Create request-to-join invitation
  async createRequestToJoin(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        project_id: projectId,
        user_id: userId,
        status: "pending",
        type: "request",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create invitation: ${error.message}`);
    }

    return data;
  }
}
