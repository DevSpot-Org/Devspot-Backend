import { createClient, SupabaseClient } from "@/lib/supabase";
import { JudgingBotScoresRepository } from "../../judging/repositories/judging-bot-scores.repository";
import { ProjectTeamMembersRepository } from "../repositories/project-team-members.repository";
import { ProjectsRepository } from "../repositories/projects.repository";
import { TokenService } from "./token.service";

export const updateProjectAllocationService = async (
  project_id: number,
  auth_user_id: string,
  body: {
    user_id: string;
    prize_allocation: number;
  }[]
) => {
  const supabase = await createClient();
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(supabase);

  // 1. Check that the caller is a project manager
  const mgr = await projectTeamMembersRepository.checkProjectManagerStatus(
    project_id,
    auth_user_id
  );
  if (!mgr || !mgr.is_project_manager) {
    throw new Error("Unauthorized: only a project manager may update allocations");
  }

  // 2. Validate input payload
  for (const item of body) {
    if (item.prize_allocation < 0) {
      throw new Error(`Invalid prize_allocation for user ${item.user_id}: must be ≥ 0`);
    }
  }

  // 3. Perform updates
  const updates = await Promise.all(
    body.map(async (item) => {
      const data = await projectTeamMembersRepository.updatePrizeAllocation(
        project_id,
        item.user_id,
        item.prize_allocation
      );
      return data;
    })
  );

  // 4. Flatten and return all updated rows
  return updates.flat();
};

export const submitProjectService = async (project_id: number) => {
  const supabase = await createClient();
  const projectsRepository = new ProjectsRepository(supabase);
  const projectTeamMembersRepository = new ProjectTeamMembersRepository(supabase);
  const judgingBotScoresRepository = new JudgingBotScoresRepository(supabase);

  const updatedProject = await projectsRepository.submitProjectWithChallenges(project_id);

  const tokenService = new TokenService(supabase);

  if (!updatedProject?.id) {
    throw new Error("Failed to get updated project ID");
  }

  const project_members = await projectTeamMembersRepository.findAllMembersByProjectId(
    updatedProject.id
  );

  const allChallenges =
    updatedProject?.project_challenges?.map(
      (item: { hackathon_challenges: { id: number } }) => item.hackathon_challenges
    ) || [];

  for (const member of project_members ?? []) {
    await tokenService.awardTokens({
      userId: member.user_id,
      amount: 150,
      category: "project_submission",
      referenceId: `project_submission_bonus_${member.user_id}_${updatedProject.id}`,
    });
  }

  const responses = await Promise.all(
    allChallenges.map(async (item: { id: number }) => {
      const data = await judgingBotScoresRepository.createBotScore(item.id, project_id);
      return data;
    })
  );

  // Filter out any null/undefined responses before mapping IDs
  const createdRecordIds = responses.filter(Boolean).map((item) => item?.id);

  if (createdRecordIds.length) {
    await assignProjectsToJudges(
      supabase,
      createdRecordIds.filter((id): id is number => id !== undefined)
    );
  }

  // const axios = (await import("axios")).default;
  // axios.post(
  //   `ec2-54-172-24-214.compute-1.amazonaws.com:3000/judge/${project_id}`
  // );

  return updatedProject;
};

// Assign projects to judges (moved from JudgingService)
export const assignProjectsToJudges = async (supabase: SupabaseClient, botScoreIds: number[]) => {
  const successfully_assigned: number[] = [];
  const skipped: number[] = [];
  const errors: Array<{ botScoreId: number; error: string }> = [];

  for (const botScoreId of botScoreIds) {
    try {
      // Get bot score data
      const { data: botScore, error: botScoreError } = await supabase
        .from("judging_bot_scores")
        .select("*")
        .eq("id", botScoreId)
        .maybeSingle();

      if (botScoreError || !botScore) {
        errors.push({ botScoreId, error: "Bot score not found" });
        continue;
      }

      // Get all judges for this challenge
      const { data: judgingChallenges, error: judgingChallengesError } = await supabase
        .from("judging_challenges")
        .select("judging_id")
        .eq("challenge_id", botScore.challenge_id);

      if (judgingChallengesError) {
        errors.push({
          botScoreId,
          error: "Failed to fetch judging challenges",
        });
        continue;
      }

      // For each judge, create a judging entry if it doesn't exist
      for (const judgingChallenge of judgingChallenges) {
        // Check if entry already exists
        const { data: existingEntry, error: existingError } = await supabase
          .from("judging_entries")
          .select("id")
          .eq("judging_id", judgingChallenge.judging_id)
          .eq("project_id", botScore.project_id)
          .eq("challenge_id", botScore.challenge_id)
          .eq("judging_bot_scores_id", botScore.id)
          .maybeSingle();

        if (existingError) {
          errors.push({
            botScoreId,
            error: "Failed to check existing entry",
          });
          continue;
        }

        if (existingEntry) {
          skipped.push(botScoreId);
          continue;
        }

        // Create new judging entry
        const { error: insertError } = await supabase.from("judging_entries").insert({
          judging_id: judgingChallenge.judging_id,
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
        });

        if (insertError) {
          errors.push({
            botScoreId,
            error: "Failed to create judging entry",
          });
          continue;
        }

        successfully_assigned.push(botScoreId);
      }
    } catch (error: any) {
      errors.push({ botScoreId, error: error.message });
    }
  }

  return {
    successfully_assigned: successfully_assigned.length,
    skipped: skipped.length,
    errors: errors.length > 0 ? errors : undefined,
  };
};
