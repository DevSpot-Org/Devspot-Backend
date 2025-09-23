import { SupabaseClient } from "@/lib/supabase";

export class JudgingChallengesRepository {
  private table = "judging_challenges" as const;

  constructor(private supabase: SupabaseClient) {}

  async findByJudgingId(judgingId: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("judging_id", judgingId);

    if (error) throw new Error("Failed to fetch judging challenges");
    return data;
  }

  async insert(judgingId: number, challengeIds: number[]) {
    const { error } = await this.supabase.from(this.table).insert(
      challengeIds.map((challenge_id) => ({
        judging_id: judgingId,
        challenge_id,
        is_winner_assigner: false,
      }))
    );

    if (error) throw new Error("Failed to insert judging challenges");
  }

  async delete(judgingId: number, challengeIds: number[]) {
    const { error } = await this.supabase
      .from(this.table)
      .delete()
      .eq("judging_id", judgingId)
      .in("challenge_id", challengeIds);

    if (error) throw new Error("Failed to delete judging challenges");
  }

  async findJudgesByChallenge(challengeId: number) {
    return this.supabase
      .from(this.table)
      .select(
        `
        judging_id,
        is_winner_assigner,
        judgings (
          *,
          user:users (*)
        )
      `
      )
      .eq("challenge_id", challengeId);
  }

  async findWinnerAssignersByJudgingId(judgingId: number) {
    return this.supabase
      .from(this.table)
      .select(
        `
          judging_id,
          is_winner_assigner,
          submitted_winners,
          challenge_id,
          judgings (
            *,
            user:users (*)
          )
        `
      )
      .eq("judging_id", judgingId)
      .eq("is_winner_assigner", true);
  }

  async findWinnerAssignerChallenges(judgingId: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select(
        `
          id,
          submitted_winners,
          hackathon_challenges (
            id,
            challenge_name,
            prizes:hackathon_challenge_bounties (*)
          )
        `
      )
      .eq("judging_id", judgingId)
      .eq("is_winner_assigner", true);

    if (error) throw new Error(error.message);
    return data;
  }

  async markSubmittedWinnersByChallengeIds(challengeIds: number[]) {
    if (!challengeIds.length) return [];
    const results = await Promise.all(
      challengeIds.map((id) =>
        this.supabase.from(this.table).update({ submitted_winners: true }).eq("challenge_id", id)
      )
    );

    return results;
  }

  async findAssignment(judgeId: number, challengeId: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("judging_id", judgeId)
      .eq("challenge_id", challengeId)
      .single();

    if (error) return null;
    return data;
  }

  async clearExistingWinnerAssigner(challengeId: number) {
    const { error } = await this.supabase
      .from(this.table)
      .update({ is_winner_assigner: false })
      .eq("challenge_id", challengeId)
      .eq("is_winner_assigner", true);

    if (error) throw new Error("Failed to clear existing winner assigner");
  }

  async updateWinnerAssigner(judgeId: number, challengeId: number, isWinnerAssigner: boolean) {
    const { data, error } = await this.supabase
      .from(this.table)
      .update({ is_winner_assigner: isWinnerAssigner })
      .eq("judging_id", judgeId)
      .eq("challenge_id", challengeId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
