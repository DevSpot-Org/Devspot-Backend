import { SupabaseClient } from "@/lib/supabase";

import { TechnologyOwnerUsersRepositoryInterface } from "../types";

export class TechnologyOwnerUsersRepository implements TechnologyOwnerUsersRepositoryInterface {
  private supabase: SupabaseClient;
  private table = "technology_owner_users";

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }
  findUserByEmail(email: string): Promise<any | null> {
    throw new Error("Method not implemented.");
  }
  findUsersByIds(userIds: string[]): Promise<any[]> {
    throw new Error("Method not implemented.");
  }

  async insertUserInvitation(
    userId: string,
    technologyOwnerId: number,
    status: string = "accepted"
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        user_id: userId,
        technology_owner_id: technologyOwnerId,
        status: status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert user invitation: ${error.message}`);
    }

    return data;
  }

  async insertEmailInvitation(
    email: string,
    technologyOwnerId: number,
    status: string = "pending"
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({
        email: email,
        technology_owner_id: technologyOwnerId,
        status: status,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert email invitation: ${error.message}`);
    }

    return data;
  }

  async upsertUserInvitations(
    invitations: Array<{ user_id: string; technology_owner_id: number; status: string }>
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .upsert(invitations, {
        onConflict: "user_id,technology_owner_id",
      })
      .select();

    if (error) {
      throw new Error(`Failed to upsert user invitations: ${error.message}`);
    }

    return data;
  }
}
