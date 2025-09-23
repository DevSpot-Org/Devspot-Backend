import { SupabaseClient } from "@/lib/supabase";
import { JudgingEntries } from "@/types/entities";

export class JudgingEntriesRepository {
  private supabase: SupabaseClient;
  private table = "judging_entries" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Get judging entries for leaderboard data
  async getLeaderboardEntries(projectIds: number[]): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
          project_id, 
          challenge_id, 
          score, 
          general_comments_summary, 
          judgings (
            users (
              full_name,
              avatar_url
            )
          )
        `
      )
      .in("project_id", projectIds);

    if (error) {
      throw new Error(`Failed to fetch judging entries: ${error.message}`);
    }

    return data || [];
  }

  async insert(entries: Partial<JudgingEntries>[]) {
    const { error } = await this.supabase
      .from(this.table)
      .insert(entries as Required<JudgingEntries>[]);
    if (error) throw new Error("Failed to create judging entries - ");
  }

  async delete(judgingId: number, challengeIds: number[]) {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("judging_id", judgingId)
      .in("challenge_id", challengeIds);

    if (error) throw new Error("Failed to delete judging entries");
  }

  async getByJudgingId(judging_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        project_id,
        standing,
        projects (
          name,
          submitted
        ),
        hackathon_challenges:challenge_id (
          id,
          challenge_name,
          sponsors
        )
      `
      )
      .eq("judging_id", judging_id);

    if (error) throw new Error(error.message);

    return data ?? [];
  }

  async getJudgesForProject(project_id: number, challenge_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("judging_id")
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id);

    if (error) throw new Error(error.message);

    return data ?? [];
  }

  async getScoresForProject(project_id: number, challenge_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("score")
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id);

    if (error) throw new Error(error.message);

    return data ?? [];
  }

  async exists(judging_id: number, project_id: number, challenge_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return !!data;
  }

  async create(entry: any) {
    const { error } = await this.supabase.from(this.table).insert([entry]);
    if (error) throw new Error(error.message);
  }

  async findEntry(judgingId: number, projectId: number, challengeId: number) {
    return this.supabase
      .from(this.table)

      .select("id")
      .eq("judging_id", judgingId)
      .eq("project_id", projectId)
      .eq("challenge_id", challengeId)
      .maybeSingle();
  }

  async deleteEntry(id: number) {
    return this.supabase.from(this.table).delete().eq("id", id);
  }

  async findByChallengeId(challengeId: number) {
    const { data, error } = await this.supabase
      .from(this.table)

      .select(
        `
        project_id,
        judging_id,
        score,
        projects!inner (*),
        judging_bot_scores:judging_bot_scores_id (*),
        judgings (
          users (
            id,
            full_name,
            avatar_url
          )
        )
      `
      )
      .eq("challenge_id", challengeId);

    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
