import { createClient } from "@/lib/supabase";
import {
  JudgingChallengesRepository,
  JudgingEntriesRepository,
  JudgingRepository,
} from "../repositories";

export const addChallengesToJudging = async (judgingId: number, challengeIds: number[]) => {
  const supabase = await createClient();
  const judgingRepo = new JudgingRepository(supabase);
  const judgingChallengesRepo = new JudgingChallengesRepository(supabase);
  const judgingEntriesRepo = new JudgingEntriesRepository(supabase);

  const judging = await judgingRepo.findById(judgingId);

  const existingChallenges = await judgingChallengesRepo.findByJudgingId(judgingId);

  const existingChallengeIds = new Set(existingChallenges.map((c) => c.challenge_id));
  const newChallengeIds = challengeIds.filter((id) => !existingChallengeIds.has(id));

  if (newChallengeIds.length > 0) {
    await judgingChallengesRepo.insert(judgingId, newChallengeIds);
  }

  const { data: botScores, error: botScoresError } = await supabase
    .from("judging_bot_scores")
    .select("*")
    .in("challenge_id", newChallengeIds);

  if (botScoresError) {
    throw new Error("Failed to fetch bot scores");
  }

  // Create judging entries for each bot score
  if (botScores && botScores.length > 0) {
    const judgingEntries = botScores.map((score) => ({
      judging_id: judgingId,
      project_id: score.project_id,
      challenge_id: score.challenge_id,
      score: score.score,
      technical_feedback: score.technical_feedback,
      technical_score: score.technical_score,
      technical_summary: score.technical_summary,
      business_feedback: score.business_feedback,
      business_score: score.business_score,
      business_summary: score.business_summary,
      innovation_feedback: score.innovation_feedback,
      innovation_score: score.innovation_score,
      innovation_summary: score.innovation_summary,
      ux_feedback: score.ux_feedback,
      ux_score: score.ux_score,
      ux_summary: score.ux_summary,
      general_comments: score.general_comments,
      general_comments_summary: score.general_comments_summary,
      judging_status: "needs_review" as const,
      flagged_comments: null,
      flagged_reason: null,
    }));

    await judgingEntriesRepo.insert(judgingEntries);
  }

  if (judging.is_submitted) {
    await judgingRepo.updateIsSubmitted(judgingId, false);
  }

  return {
    judging_id: judgingId,
    challenges_added: newChallengeIds.length,
    total_challenges: existingChallengeIds.size + newChallengeIds.length,
  };
};

export const removeChallengesFromJudging = async (judgingId: number, challengeIds: number[]) => {
  const supabase = await createClient();
  const judgingChallengesRepo = new JudgingChallengesRepository(supabase);
  const judgingEntriesRepo = new JudgingEntriesRepository(supabase);

  const existingChallenges = await judgingChallengesRepo.findByJudgingId(judgingId);
  const existingChallengeIds = new Set(existingChallenges.map((c) => c.challenge_id));

  const challengesToRemove = challengeIds.filter((id) => existingChallengeIds.has(id));
  const challengesSkipped = challengeIds.filter((id) => !existingChallengeIds.has(id));

  if (challengesToRemove.length > 0) {
    await judgingChallengesRepo.delete(judgingId, challengesToRemove);
    await judgingEntriesRepo.delete(judgingId, challengesToRemove);
  }

  return {
    judging_id: judgingId,
    challenges_removed: challengesToRemove.length,
    challenges_skipped: challengesSkipped.length,
    remaining_challenges: existingChallengeIds.size - challengesToRemove.length,
  };
};
