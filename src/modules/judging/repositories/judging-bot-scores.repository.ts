import { SupabaseClient } from "@/lib/supabase";

interface JudgingBotScoresRepositoryInterface {
  findById(id: number): Promise<any | null>;
  getJudgingChallengesByChallengeId(challenge_id: number): Promise<any[]>;
  checkExistingJudgingEntry(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    judging_bot_scores_id: number
  ): Promise<any | null>;
  createJudgingEntry(entryData: any): Promise<any>;
  createBotScore(challengeId: number, projectId: number): Promise<any>;
}

export class JudgingBotScoresRepository
  implements JudgingBotScoresRepositoryInterface
{
  private table = "judging_bot_scores" as const;
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<any | null> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async getJudgingChallengesByChallengeId(
    challenge_id: number
  ): Promise<any[]> {
    const { data, error } = await this.supabase
      .from("judging_challenges")
      .select("judging_id")
      .eq("challenge_id", challenge_id);

    if (error) throw new Error(error.message);

    return data || [];
  }

  async checkExistingJudgingEntry(
    judging_id: number,
    project_id: number,
    challenge_id: number,
    judging_bot_scores_id: number
  ): Promise<any | null> {
    const { data, error } = await this.supabase
      .from("judging_entries")
      .select("id")
      .eq("judging_id", judging_id)
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .eq("judging_bot_scores_id", judging_bot_scores_id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data;
  }

  async createJudgingEntry(entryData: any): Promise<any> {
    const { data, error } = await this.supabase
      .from("judging_entries")
      .insert(entryData)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }

  async createBotScore(challengeId: number, projectId: number): Promise<any> {
    const { data, error } = await this.supabase
      .from(this.table)
      .insert({ challenge_id: challengeId, project_id: projectId })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getByProjectAndChallenge(project_id: number, challenge_id: number) {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("*")
      .eq("project_id", project_id)
      .eq("challenge_id", challenge_id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return data;
  }
}
