import { SupabaseClient } from "@/lib/supabase";

import { TechnologyOwnerUserFollowingRepositoryInterface } from "../types";

export class TechnologyOwnerUserFollowingRepository
  implements TechnologyOwnerUserFollowingRepositoryInterface
{
  private table = "technology_owner_user_following" as const;

  constructor(private supabase: SupabaseClient) {}

  async findFollowStatus(technologyOwnerId: number, userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select()
      .eq("technology_owner_id", technologyOwnerId)
      .eq("user_id", userId)
      .single();

    return !!data;
  }

  async toggleFollow(
    technologyOwnerId: number,
    userId: string
  ): Promise<{ success: boolean; action: string }> {
    const { data: existingFollow } = await this.supabase
      .from(this.table)
      .select()
      .eq("technology_owner_id", technologyOwnerId)
      .eq("user_id", userId)
      .single();

    if (existingFollow) {
      const { error: deleteError } = await this.supabase
        .from(this.table)
        .delete()
        .eq("technology_owner_id", technologyOwnerId)
        .eq("user_id", userId);

      if (deleteError) {
        throw new Error(`Failed to unfollow technology owner: ${deleteError.message}`);
      }

      return {
        success: true,
        action: "unfollowed",
      };
    }

    // If not following, create new follow record
    const { error: insertError } = await this.supabase.from(this.table).insert({
      technology_owner_id: technologyOwnerId,
      user_id: userId,
    });

    if (insertError) {
      throw new Error(`Failed to follow technology owner: ${insertError.message}`);
    }

    return {
      success: true,
      action: "followed",
    };
  }
}
