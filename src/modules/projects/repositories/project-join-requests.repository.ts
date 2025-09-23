import { SupabaseClient } from "@/lib/supabase";
import { ProjectJoinRequestsRepositoryInterface } from "../types";

export class ProjectJoinRequestsRepository implements ProjectJoinRequestsRepositoryInterface {
  private supabase: SupabaseClient;
  private table = "project_join_requests";

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createJoinRequest(projectId: number, userId: string, message?: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        project_id: projectId,
        user_id: userId,
        message: message || "",
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create join request: ${error.message}`);
    }

    return data;
  }

  async updateJoinRequestStatus(requestId: number, status: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ status })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update join request status: ${error.message}`);
    }

    return data;
  }

  async findJoinRequestByProjectAndUser(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error finding join request by project and user:", error);
      return null;
    }

    return data;
  }

  async findJoinRequestsByProject(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        id,
        user_id,
        message,
        status,
        created_at,
        users (
          id,
          full_name,
          avatar_url,
          email
        )
      `
      )
      .eq("project_id", projectId);

    if (error) {
      console.error("Error finding join requests by project:", error);
      return [];
    }

    return data || [];
  }
}
