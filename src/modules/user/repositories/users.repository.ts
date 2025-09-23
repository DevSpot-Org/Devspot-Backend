import { createClient, SupabaseClient } from "@/lib/supabase";

export class UsersRepository {
  private supabase: SupabaseClient;
  private table = "users" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findUserByEmail(email: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error finding user by email:", error);
      return null;
    }

    return data;
  }

  async findUsersByIds(userIds: string[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id, email, full_name")
      .in("id", userIds);

    if (error) {
      console.error("Error finding users by IDs:", error);
      return [];
    }

    return data || [];
  }

  async findById(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  }

  async updateUserFields(userId: string, updates: Record<string, any>) {
    const { error } = await this.supabase.from(this.table).update(updates).eq("id", userId);

    if (error) {
      throw new Error(`Failed to update user fields: ${error.message}`);
    }
  }

  async getTopUsers(userId?: string) {
    let query = this.supabase
      .from("top_people_view")
      .select("*")
      .order("completion_percentage", { ascending: false })
      .order("full_name", { ascending: true })
      .limit(10);

    if (userId) query = query.not("id", "eq", userId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getPeopleCount() {
    const { count, error } = await this.supabase
      .from(this.table)
      .select("*", { count: "exact", head: true });

    if (error) throw new Error(error.message);
    return count || 0;
  }

  async findUserWithRelations(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        *,
        roles:user_participant_roles(*, participant_roles(*)),
        wallets:participant_wallets(*),
        technology_organizations:technology_owner_users(
          id,
          technology_owner_id,
          technology_owners(
            *,
            technology_owner_users(
              users:users(*),
              email,
              status,
              created_at
            )
          )
        )
      `
      )
      .eq(isUUID ? "id" : "slug", identifier)
      .maybeSingle();

    if (error) throw new Error(`Failed to retrieve user profile: ${error.message}`);
    return data;
  }

  async deleteAccount(userId: string) {
    const admin = await createClient({
      isAdmin: true,
    });

    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(`Failed to delete user account (auth): ${authError.message}`);
    }

    // Delete from "users" table
    const { error: dbError } = await this.supabase.from(this.table).delete().eq("id", userId);

    if (dbError) {
      throw new Error(`Failed to delete user account (db): ${dbError.message}`);
    }

    return null;
  }
}
