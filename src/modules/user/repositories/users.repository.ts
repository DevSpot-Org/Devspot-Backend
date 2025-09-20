import { SupabaseClient } from "@/lib/supabase";

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
}
