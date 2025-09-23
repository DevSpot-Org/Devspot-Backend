import { ParticipantRoles, UserParticipantRoles } from "@/types/entities";
import { SupabaseClient } from "@supabase/supabase-js";

export class ParticipantRolesRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Gets all the sub-roles for participants
   *
   * @returns The sub role for all participants.
   *
   * @author Drex
   */
  async get_all_participant_roles(): Promise<ParticipantRoles[]> {
    const { data, error } = await this.supabase.from("participant_roles").select("*");

    if (error) {
      throw new Error(`Error fetching participant roles: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Gets all the sub-roles that belong to a participant
   *
   * @param participantId The participant's ID.
   * @returns The role assignments for the participant.
   *
   * @author Drex
   */
  async get_roles_for_participant(participant_id: string): Promise<UserParticipantRoles[]> {
    const { data, error } = await this.supabase
      .from("user_participant_roles")
      .select("*, participant_roles(*)")
      .eq("participant_id", participant_id);

    if (error) {
      throw new Error(`Error fetching roles for participant ${participant_id}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update a participant's roles by synchronizing the current roles with the provided array of role IDs.
   *
   * The function:
   * - Fetches the participant's current role assignments.
   * - Determines which roles to remove (those that are no longer in the new list).
   * - Determines which new roles to add.
   * - Performs the deletes and inserts as needed.
   *
   * @param participant_id The participant's ID.
   * @param new_role_ids An array of role IDs (from participant_roles) that should be assigned.
   * @param primary_role_id This is the ID of the primary role
   * @returns The updated array of role assignments for the participant.
   *
   * @author Drex
   */
  async update_roles_for_participant(
    participant_id: string,
    new_role_ids: number[],
    primary_role_id?: number
  ): Promise<UserParticipantRoles[]> {
    if (new_role_ids.length < 1 && !primary_role_id) return [];

    const { data: current_assignments, error: select_error } = await this.supabase
      .from("user_participant_roles")
      .select("*")
      .eq("participant_id", participant_id);

    if (select_error) {
      throw new Error(`Error fetching current role assignments: ${select_error.message}`);
    }

    const current_assignments_data = current_assignments || [];

    // Build Sets for easier lookup of current and new role IDs.
    const current_role_ids = new Set(current_assignments_data.map((a) => a.role_id));

    const new_role_ids_set = new Set(new_role_ids);

    const roles_to_remove =
      current_assignments_data?.filter((a) => !new_role_ids_set.has(a.role_id)) ?? [];
    const roles_to_add = new_role_ids?.filter((roleId) => !current_role_ids.has(roleId)) ?? [];

    if (roles_to_remove?.length > 0) {
      const ids_to_remove = roles_to_remove.map((item) => item.id);
      const { error: deleteError } = await this.supabase
        .from("user_participant_roles")
        .delete()
        .in("id", ids_to_remove);

      if (deleteError) {
        throw new Error(`Error removing roles: ${deleteError.message}`);
      }
    }

    const { data: existingPrimary } = await this.supabase
      .from("user_participant_roles")
      .select("id, role_id")
      .eq("participant_id", participant_id)
      .eq("is_primary", true)
      .maybeSingle();

    if (existingPrimary && existingPrimary.role_id !== primary_role_id) {
      const { error: updateError } = await this.supabase
        .from("user_participant_roles")
        .update({ is_primary: false })
        .eq("id", existingPrimary.id);

      if (updateError) {
        throw new Error(`Error updating existing primary role: ${updateError.message}`);
      }
    }

    // Add new roles
    if (roles_to_add?.length > 0) {
      const inserts = roles_to_add.map((roleId) => ({
        participant_id: participant_id,
        role_id: roleId,
        is_primary: roleId == primary_role_id,
      }));

      const { error: insert_error } = await this.supabase
        .from("user_participant_roles")
        .insert(inserts);

      if (insert_error) {
        throw new Error(`Error inserting new roles: ${insert_error.message}`);
      }
    }

    if (primary_role_id) {
      // 1) Look up the name
      const { data: roleRecord, error: roleError } = await this.supabase
        .from("participant_roles")
        .select("name")
        .eq("id", primary_role_id)
        .maybeSingle();

      if (roleError) {
        throw new Error(`Error fetching role name: ${roleError.message}`);
      }

      const roleName = roleRecord?.name;
      if (roleName) {
        // 2) Update the users table
        const { error: userUpdateError } = await this.supabase
          .from("users")
          .update({ main_role: roleName })
          .eq("id", participant_id);

        if (userUpdateError) {
          throw new Error(`Error setting users.main_role: ${userUpdateError.message}`);
        }
      }
    }

    // Ensure the new primary (if still present) is correctly marked
    if (
      primary_role_id &&
      !roles_to_add.includes(primary_role_id) && // it wasn't just inserted
      (!existingPrimary || existingPrimary.role_id !== primary_role_id)
    ) {
      const { data: matchPrimary, error: matchError } = await this.supabase
        .from("user_participant_roles")
        .update({ is_primary: true })
        .eq("participant_id", participant_id)
        .eq("role_id", primary_role_id);

      if (matchError) {
        throw new Error(`Error setting new primary role: ${matchError.message}`);
      }
    }

    const { data: updated_assignments, error: fetch_error } = await this.supabase
      .from("user_participant_roles")
      .select("*")
      .eq("participant_id", participant_id);

    if (fetch_error) {
      throw new Error(`Error fetching updated roles: ${fetch_error.message}`);
    }

    return updated_assignments || [];
  }
}
