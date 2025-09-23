import { SupabaseClient } from "@/lib/supabase";
import { ProjectTeamMembersRepositoryInterface } from "../types";

export class ProjectTeamMembersRepository implements ProjectTeamMembersRepositoryInterface {
  private supabase: SupabaseClient;
  private table = "project_team_members" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findByProjectId(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        id,
        user_id,
        role,
        status,
        joined_at,
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
      console.error("Error finding team members by project ID:", error);
      return [];
    }

    return data || [];
  }

  async addMember(projectId: number, userId: string, role: string = "member"): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        project_id: projectId,
        user_id: userId,
        role: role,
        status: "pending",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add team member: ${error.message}`);
    }

    return data;
  }

  async removeMember(projectId: number, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }

  async updateMemberStatus(
    projectId: number,
    userId: string,
    status: "pending" | "rejected" | "confirmed"
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ status })
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update member status: ${error.message}`);
    }

    return data;
  }

  async findInvitationsByProjectId(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("project_invitations")
      .select(
        `
        id,
        email,
        user_id,
        role,
        status,
        created_at
      `
      )
      .eq("project_id", projectId);

    if (error) {
      console.error("Error finding invitations by project ID:", error);
      return [];
    }

    return data || [];
  }

  async checkProjectManagerStatus(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("is_project_manager")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updatePrizeAllocation(
    projectId: number,
    userId: string,
    prizeAllocation: number
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ prize_allocation: prizeAllocation })
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findAllMembersByProjectId(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Check if user is a confirmed team member for a project
  async checkTeamMemberStatus(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check team member status: ${error.message}`);
    }

    return data;
  }

  // Check if user is already a team member (any status)
  async checkExistingMembership(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check existing membership: ${error.message}`);
    }

    return data;
  }

  // Get confirmed members for a project
  async getConfirmedMembers(projectId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id, user_id, users ( full_name, avatar_url )")
      .eq("project_id", projectId)
      .eq("status", "confirmed");

    if (error) {
      throw new Error(`Failed to fetch confirmed members: ${error.message}`);
    }

    return data || [];
  }

  // Find next member to promote (earliest created_at)
  async findNextMemberToPromote(projectId: number, excludeUserId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .neq("user_id", excludeUserId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw new Error(`Error finding replacement PM: ${error.message}`);
    }

    return data;
  }

  // Promote member to project manager
  async promoteToProjectManager(projectId: number, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.table)
      .update({ is_project_manager: true })
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to promote new PM: ${error.message}`);
    }
  }

  // Redistribute prize allocation among confirmed members
  async redistributePrizeAllocation(projectId: number): Promise<void> {
    // 1) fetch all confirmed member IDs for this project
    const { data: members, error: fetchError } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("project_id", projectId)
      .eq("status", "confirmed");

    if (fetchError) {
      throw new Error(`Failed to fetch confirmed members: ${fetchError.message}`);
    }

    // if nobody is confirmed we can leave all prize_allocations untouched (or zero them out)
    if (!members || members.length === 0) {
      return;
    }

    // 2) compute equal share
    const share = 100 / members.length;

    // 3) bulk‐update every confirmed member
    const { error: updateError } = await this.supabase
      .from(this.table)
      .update({ prize_allocation: share })
      .eq("project_id", projectId)
      .eq("status", "confirmed");

    if (updateError) {
      throw new Error(`Failed to redistribute prize allocations: ${updateError.message}`);
    }
  }

  // Insert multiple team members
  async insertTeamMembers(
    projectId: number,
    members: Array<{ user_id: string; is_project_manager: boolean }>
  ): Promise<any[]> {
    const payload = members.map((m) => ({
      project_id: projectId,
      user_id: m.user_id,
      is_project_manager: m.is_project_manager,
    }));

    const { error: insertErr, data: insertedRows } = await this.supabase
      .from(this.table)
      .insert(payload)
      .select("id, user_id, status");

    if (insertErr) {
      throw new Error(`Failed to insert team members: ${insertErr.message}`);
    }

    return insertedRows || [];
  }

  // Delete multiple team members
  async deleteTeamMembers(projectId: number, userIds: string[]): Promise<any[]> {
    const { error: deleteErr, data: deletedRows } = await this.supabase
      .from(this.table)
      .delete()
      .eq("project_id", projectId)
      .in("user_id", userIds)
      .select("id");

    if (deleteErr) {
      throw new Error(`Failed to delete team members: ${deleteErr.message}`);
    }

    return deletedRows || [];
  }

  // Update team member project manager status
  async updateTeamMemberManagerStatus(
    projectId: number,
    userId: string,
    isProjectManager: boolean
  ): Promise<void> {
    const { error: updErr } = await this.supabase
      .from(this.table)
      .update({ is_project_manager: isProjectManager })
      .match({ project_id: projectId, user_id: userId });

    if (updErr) {
      throw new Error(`Failed to update team member: ${updErr.message}`);
    }
  }

  // Get pending invitation for a user
  async getPendingInvitation(projectId: number, userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (error) {
      console.error("Invitation fetch error:", error.message);
      return null;
    }

    return data;
  }

  // Update invitation status and return with user data
  async updateInvitationStatus(
    projectId: number,
    userId: string,
    status: "approve" | "reject"
  ): Promise<any> {
    // 1) flip the one invitation
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ status: status === "approve" ? "confirmed" : "rejected" })
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .select(
        `
        *,
        users (
          id,
          full_name,
          email,
          main_role
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Failed to ${status} invitation: ${error.message}`);
    }

    // 2) redistribute prize_allocation among the confirmed members
    await this.redistributePrizeAllocation(projectId);

    // 3) return the updated row for convenience
    return data;
  }

  async addTeamMember(projectId: number, userId: string): Promise<void> {
    const { error: teamMemberError } = await this.supabase
      .from(this.table)

      .insert({
        project_id: projectId,
        user_id: userId,
        is_project_manager: true,
        status: "confirmed",
        prize_allocation: 100,
      })
      .select()
      .single();

    if (teamMemberError) {
      throw new Error(`Failed to Add Team member: ${teamMemberError.message}`);
    }
  }

  async countByUserId(userId: string) {
    const { count, error } = await this.supabase
      .from(this.table)
      .select("project_id", { head: true, count: "exact" })
      .eq("user_id", userId);

    if (error) {
      console.error("Couldn't load project_count for", userId, error);
      return 0;
    }

    return count || 0;
  }
}
