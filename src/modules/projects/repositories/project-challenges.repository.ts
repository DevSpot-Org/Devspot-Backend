import { SupabaseClient } from "@/lib/supabase";
export class ProjectChallengesRepository {
  private supabase: SupabaseClient;
  private table = "project_challenges" as const;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // Delete all challenges for a project
  async deleteByProjectId(projectId: number): Promise<void> {
    const { error } = await this.supabase.from(this.table).delete().eq("project_id", projectId);

    if (error) {
      throw new Error(`Failed to delete old challenges: ${error.message}`);
    }
  }

  async findByChallengeId(challengeId: number) {
    return this.supabase
      .from(this.table)
      .select(
        `
        project_id,
        projects:projects!inner (
          id,
          submitted
        )
      `
      )
      .eq("challenge_id", challengeId);
  }

  // Insert new challenge links for a project
  async insertChallengeLinks(projectId: number, challengeIds: number[]): Promise<void> {
    const newChallengeLinks = challengeIds.map((challenge_id) => ({
      project_id: projectId,
      challenge_id,
    }));

    const { error } = await this.supabase.from(this.table).insert(newChallengeLinks);

    if (error) {
      throw new Error(`Failed to insert new challenges: ${error.message}`);
    }
  }

  // Get project challenges with leaderboard data for a hackathon
  async getLeaderboardData(hackathonId: number): Promise<any[]> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
        project_id,
        challenge_id,
        rank,
        prize_id,
        projects (
          *,
          project_team_members (
            id,
            is_project_manager,
            status,
            users (
              id,
              full_name,
              email,
              avatar_url
            )
          )
        ),
        hackathon_challenges!inner (
          challenge_name,
          sponsors,
          hackathon_id
        )
      `
      )
      .eq("hackathon_challenges.hackathon_id", hackathonId)
      .not("prize_id", "is", null);

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  }

  async linkProjectChallenges(projectId: number, challengeIds: number[]): Promise<void> {
    const challengeInserts = challengeIds.map((challengeId) => ({
      project_id: projectId,
      challenge_id: challengeId,
    }));

    const { error: challengeError } = await this.supabase.from(this.table).insert(challengeInserts);

    if (challengeError) {
      throw new Error(`Failed to link challenges: ${challengeError.message}`);
    }
  }

  async findByPrizeIds(prizeIds: number[]) {
    if (!prizeIds?.length) return [];
    const { data, error } = await this.supabase
      .from(this.table)
      .select("project_id, prize_id")
      .in("prize_id", prizeIds);

    if (error) throw new Error(error.message);
    return data;
  }

  async findByChallengeIdsAndProjectIds(challengeIds: number[], projectIds: number[]) {
    if (!challengeIds.length || !projectIds.length) return [];
    const { data, error } = await this.supabase
      .from(this.table)
      .select("project_id, challenge_id")
      .in("challenge_id", challengeIds)
      .in("project_id", projectIds);

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async batchUpdateProjectChallenges(
    updates: Array<{
      project_id: number;
      challenge_id: number;
      prize_id: number | null;
      rank: number | null;
    }>
  ) {
    const results = await Promise.all(
      updates.map((u) =>
        this.supabase
          .from(this.table)
          .update({ prize_id: u.prize_id, rank: u.rank })
          .eq("project_id", u.project_id)
          .eq("challenge_id", u.challenge_id)
      )
    );

    return results;
  }
}
