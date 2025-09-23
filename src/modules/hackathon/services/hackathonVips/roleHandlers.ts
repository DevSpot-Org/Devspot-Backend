import { JudgingBotScores } from "@/types/entities";
import { RoleHandler, VIPRole, VipList } from "./types";

class JudgeRoleHandler extends RoleHandler {
  getRoleName(): VIPRole {
    return "judge";
  }

  async getRoleId(): Promise<number> {
    return this.getRoleIdFromDB("judge");
  }

  validateRoleData(vipData: VipList): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!vipData.challengeIds || vipData.challengeIds.length === 0) {
      errors.push("Challenge IDs are required for judges");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async createRoleRecord(
    hackathonId: number,
    userId: string,
    vipData: VipList
  ): Promise<void> {
    const judging = await this.createJudgingRecord(hackathonId, userId);

    if (vipData.challengeIds?.length) {
      await this.assignChallengesAndProcessBotScores(
        judging.id,
        vipData.challengeIds
      );
    }

    const roleId = await this.getRoleId();
    await this.updateUserRole(userId, roleId, hackathonId);
  }

  private async createJudgingRecord(hackathonId: number, userId: string) {
    const { data: judging, error } = await this.supabase
      .from("judgings")
      .insert({
        hackathon_id: hackathonId,
        user_id: userId,
        is_submitted: false,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`Failed to create judging record: ${error.message}`);
    }

    return judging;
  }

  private async assignChallengesAndProcessBotScores(
    judgingId: number,
    challengeIds: number[]
  ) {
    await this.assignChallenges(judgingId, challengeIds);

    const botScores = await this.fetchBotScores(challengeIds);
    await this.processBotScores(judgingId, botScores);
  }

  private async assignChallenges(judgingId: number, challengeIds: number[]) {
    const challengeRecords = challengeIds.map((challengeId) => ({
      challenge_id: challengeId,
      judging_id: judgingId,
      is_winner_assigner: false,
    }));

    const { error } = await this.supabase
      .from("judging_challenges")
      .insert(challengeRecords);

    if (error) {
      throw new Error(`Failed to add challenges to judging: ${error.message}`);
    }
  }

  private async fetchBotScores(challengeIds: number[]) {
    const { data, error } = await this.supabase
      .from("judging_bot_scores")
      .select("*")
      .in("challenge_id", challengeIds);

    if (error) {
      throw new Error(`Failed to fetch bot scores: ${error.message}`);
    }

    return data;
  }

  private async processBotScores(
    judgingId: number,
    botScores: JudgingBotScores[]
  ) {
    const existingEntries = await this.getExistingBotScoresEntriesforJudge(
      judgingId
    );

    const existingScoreIds = new Set(
      existingEntries?.map((entry) => entry.judging_bot_scores_id) || []
    );

    await this.createJudgingEntries(judgingId, existingScoreIds, botScores);
  }

  private async getExistingBotScoresEntriesforJudge(judgingId: number) {
    const { data: existingEntries } = await this.supabase
      .from("judging_entries")
      .select("judging_bot_scores_id")
      .eq("judging_id", judgingId);

    return existingEntries;
  }

  private async createJudgingEntries(
    judgingId: number,
    existingScoreIds: Set<number | null>,
    botScores: JudgingBotScores[]
  ) {
    const newEntries = botScores
      .filter((score) => !existingScoreIds.has(score.id))
      .map((botScore) => ({
        judging_id: judgingId,
        project_id: botScore.project_id,
        challenge_id: botScore.challenge_id,
        score: botScore.score,
        technical_feedback: botScore.technical_feedback,
        technical_score: botScore.technical_score,
        technical_summary: botScore.technical_summary,
        business_feedback: botScore.business_feedback,
        business_score: botScore.business_score,
        business_summary: botScore.business_summary,
        innovation_feedback: botScore.innovation_feedback,
        innovation_score: botScore.innovation_score,
        innovation_summary: botScore.innovation_summary,
        ux_feedback: botScore.ux_feedback,
        ux_score: botScore.ux_score,
        ux_summary: botScore.ux_summary,
        general_comments: botScore.general_comments,
        general_comments_summary: botScore.general_comments_summary,
        judging_status: "needs_review",
        flagged_comments: null,
        flagged_reason: null,
        standing: null,
        judging_bot_scores_id: botScore.id,
      }));

    if (newEntries.length > 0) {
      const { error: bulkInsertError } = await this.supabase
        .from("judging_entries")
        .insert(newEntries as any[]);

      if (bulkInsertError) {
        throw new Error(
          `Failed to create judging entries: ${bulkInsertError.message}`
        );
      }
    }
  }

  async deleteRoleRecord(hackathonId: number, userId: string): Promise<void> {
    const { data: judging } = await this.supabase
      .from("judgings")
      .select("id")
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId)
      .single();

    if (judging) {
      await this.supabase
        .from("judging_challenges")
        .delete()
        .eq("judging_id", judging.id);

      await this.supabase
        .from("judging_entries")
        .delete()
        .eq("judging_id", judging.id);

      await this.supabase.from("judgings").delete().eq("id", judging.id);
    }
  }

  private async updateUserRole(
    userId: string,
    roleId: number,
    hackathonId: number
  ): Promise<void> {
    const operations = [
      this.supabase.from("users").update({ role_id: roleId }).eq("id", userId),
      this.supabase.from("hackathon_vip_roles").upsert(
        {
          user_id: userId,
          role_id: roleId,
          hackathon_id: hackathonId,
        },
        { onConflict: "user_id,role_id,hackathon_id" }
      ),
    ];

    const results = await Promise.all(operations);
    for (const result of results) {
      if (result.error) {
        throw new Error(`Error updating user roles: ${result.error.message}`);
      }
    }
  }
}

class MentorRoleHandler extends RoleHandler {
  getRoleName(): VIPRole {
    return "mentor";
  }

  getRoleId(): Promise<number> {
    return this.getRoleIdFromDB("mentor");
  }

  validateRoleData(vipData: VipList): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async createRoleRecord(
    hackathonId: number,
    userId: string,
    vipData: VipList
  ): Promise<void> {
    const roleId = await this.getRoleId();

    await this.updateUserRole(userId, roleId, hackathonId);
  }

  async deleteRoleRecord(hackathonId: number, userId: string): Promise<void> {
    const { error: updateError } = await this.supabase
      .from("hackathon_vips")
      .update({
        office_hours: null,
      })
      .eq("hackathon_id", hackathonId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Error updating user roles: ${updateError.message}`);
    }
  }

  private async updateUserRole(
    userId: string,
    roleId: number,
    hackathonId: number
  ): Promise<void> {
    const operations = [
      this.supabase.from("users").update({ role_id: roleId }).eq("id", userId),
      this.supabase.from("hackathon_vip_roles").upsert(
        {
          user_id: userId,
          role_id: roleId,
          hackathon_id: hackathonId,
        },
        { onConflict: "user_id,role_id,hackathon_id" }
      ),
    ];

    const results = await Promise.all(operations);
    for (const result of results) {
      if (result.error) {
        throw new Error(`Error updating user roles: ${result.error.message}`);
      }
    }
  }
}

export { JudgeRoleHandler, MentorRoleHandler };
