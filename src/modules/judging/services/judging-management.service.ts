import { BadRequestError, UnauthorizedError } from "@/lib/errorHandler";
import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ChallengesRepository } from "@/modules/hackathon";
import { ProjectChallengesRepository } from "@/modules/projects/repositories/project-challenges.repository";
import { ProjectTeamMembersRepository } from "@/modules/projects/repositories/project-team-members.repository";
import { UsersRepository } from "@/modules/user/repositories";
import {
  JudgingBotScoresRepository,
  JudgingChallengesRepository,
  JudgingEntriesRepository,
  JudgingEntryRepository,
  JudgingRepository,
} from "../repositories";
import {
  AssignProjectsRequest,
  AssignProjectsResponse,
  CreateJudgingRequest,
  GetJudgingChallengesParams,
  GetJudgingProgressParams,
  SubmitJudgingParams,
} from "../types";

const createJudgingService = async (body: CreateJudgingRequest) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const existing = await judgingRepository.findByUserAndHackathon(body.user_id, body.hackathon_id);

  if (existing) {
    throw new Error("Judge already assigned to this hackathon");
  }

  return await judgingRepository.create(body.user_id, body.hackathon_id);
};

const assignProjectsService = async (
  body: AssignProjectsRequest
): Promise<AssignProjectsResponse> => {
  const supabase = await createClient();
  const judgingBotScoresRepository = new JudgingBotScoresRepository(supabase);

  const results = [];

  for (const botScoreId of body.botScoreIds) {
    const botScore = await judgingBotScoresRepository.findById(botScoreId);

    if (!botScore) {
      throw new Error(`Bot score with ID ${botScoreId} not found`);
    }

    const judgingChallenges = await judgingBotScoresRepository.getJudgingChallengesByChallengeId(
      botScore.challenge_id
    );

    for (const judgingChallenge of judgingChallenges) {
      const existingEntry = await judgingBotScoresRepository.checkExistingJudgingEntry(
        judgingChallenge.judging_id,
        botScore.project_id,
        botScore.challenge_id,
        botScoreId
      );

      if (!existingEntry) {
        const entryData = {
          judging_id: judgingChallenge.judging_id,
          project_id: botScore.project_id,
          challenge_id: botScore.challenge_id,
          judging_bot_scores_id: botScoreId,
          judging_status: "needs_review",
        };

        const newEntry = await judgingBotScoresRepository.createJudgingEntry(entryData);
        results.push(newEntry);
      }
    }
  }

  return {
    successfully_assigned: results.length,
    skipped: 0,
  };
};

const submitJudgingService = async (params: SubmitJudgingParams) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(params.judging_id, user?.id);

  if (!isOwner) {
    throw new Error("You are not authorized to submit this judging");
  }

  return await judgingRepository.submitJudging(params.judging_id);
};

const getJudgingProgressService = async (params: GetJudgingProgressParams) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(params.judging_id, user.id);

  if (!isOwner) {
    throw new Error("You are not authorized to view this judging progress");
  }

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  return await judgingEntryRepository.getJudgingProgress(params.judging_id);
};

const getJudgingChallengesService = async (params: GetJudgingChallengesParams) => {
  const supabase = await createClient();

  const judgingRepository = new JudgingRepository(supabase);

  return await judgingRepository.getJudgingChallenges(params.judging_id);
};

const getProjectsAJudgeIsJudgingService = async (judging_id: number) => {
  const supabase = await createClient();

  const judgingEntriesRepo = new JudgingEntriesRepository(supabase);
  const teamMembersRepo = new ProjectTeamMembersRepository(supabase);
  const judgingsRepo = new JudgingRepository(supabase);
  const usersRepo = new UsersRepository(supabase);

  const entries = await judgingEntriesRepo.getByJudgingId(judging_id);

  const results = await Promise.all(
    entries.map(async (e: any) => {
      // Team members
      const teamMembers = await teamMembersRepo.getConfirmedMembers(e.project_id);

      // Judges
      const judgeEntries = await judgingEntriesRepo.getJudgesForProject(
        e.project_id,
        e.hackathon_challenges.id
      );

      const judges = await Promise.all(
        judgeEntries.map(async (je: any) => {
          const j = await judgingsRepo.getUserById(je.judging_id);
          const u = await usersRepo.findById(j.user_id);

          return {
            judging_id: je.judging_id,
            full_name: u.full_name,
            avatar_url: u.avatar_url,
          };
        })
      );

      // Scores
      const scoreEntries = await judgingEntriesRepo.getScoresForProject(
        e.project_id,
        e.hackathon_challenges.id
      );
      const scores = scoreEntries
        .map((s: any) => s.score)
        .filter((s: any) => s !== null && s !== undefined);
      const averageScore =
        scores.length > 0
          ? scores.reduce((sum: number, s: number) => sum + s, 0) / scores.length
          : null;

      return {
        project_id: e.project_id,
        name: e.projects.name,
        submitted: e.projects.submitted,
        team_members: teamMembers.map((tm: any) => ({
          user_id: tm.user_id,
          full_name: tm.users.full_name,
          avatar_url: tm.users.avatar_url,
        })),
        challenges: [
          {
            challenge_id: e.hackathon_challenges.id,
            challenge_name: e.hackathon_challenges.challenge_name,
            sponsors: e.hackathon_challenges.sponsors,
            score: averageScore,
            standing: e.standing,
            judges,
          },
        ],
      };
    })
  );

  return results;
};

const addJudgeToProjectsService = async (
  judging_id: number,
  project_challenge_pairs: { project_id: number; challenge_id: number }[]
) => {
  const supabase = await createClient();

  const judgingEntriesRepo = new JudgingEntriesRepository(supabase);
  const botScoresRepo = new JudgingBotScoresRepository(supabase);

  const successfully_added: { project_id: number; challenge_id: number }[] = [];
  const skipped: { project_id: number; challenge_id: number }[] = [];

  for (const pair of project_challenge_pairs) {
    const { project_id, challenge_id } = pair;

    const exists = await judgingEntriesRepo.exists(judging_id, project_id, challenge_id);

    if (exists) {
      skipped.push(pair);
      continue;
    }

    const botScore = await botScoresRepo.getByProjectAndChallenge(project_id, challenge_id);

    if (!botScore) {
      skipped.push(pair);
      continue;
    }

    await judgingEntriesRepo.create({
      judging_id,
      project_id,
      challenge_id,
      score: botScore.score,
      technical_feedback: botScore.technical_feedback,
      technical_score: botScore.technical_score,
      technical_summary: botScore.technical_summary,
      innovation_feedback: botScore.innovation_feedback,
      innovation_score: botScore.innovation_score,
      innovation_summary: botScore.innovation_summary,
      ux_feedback: botScore.ux_feedback,
      ux_score: botScore.ux_score,
      ux_summary: botScore.ux_summary,
      business_feedback: botScore.business_feedback,
      business_score: botScore.business_score,
      business_summary: botScore.business_summary,
      general_comments: botScore.general_comments,
      general_comments_summary: botScore.general_comments_summary,
      judging_status: "needs_review",
      flagged_comments: null,
      flagged_reason: null,
      standing: null,
    });

    successfully_added.push(pair);
  }

  return { successfully_added, skipped };
};

const removeJudgeFromProjectsService = async (
  judgingId: number,
  projectChallengePairs: { project_id: number; challenge_id: number }[]
) => {
  const supabase = await createClient();

  const repo = new JudgingEntriesRepository(supabase);

  const successfully_removed: { project_id: number; challenge_id: number }[] = [];
  const skipped: { project_id: number; challenge_id: number }[] = [];

  for (const { project_id, challenge_id } of projectChallengePairs) {
    const { data: existing, error: existingError } = await repo.findEntry(
      judgingId,
      project_id,
      challenge_id
    );

    if (existingError) {
      throw new Error(`Error checking existing judging entry: ${existingError.message}`);
    }

    if (!existing) {
      skipped.push({ project_id, challenge_id });
      continue;
    }

    const { error: deleteError } = await repo.deleteEntry(existing.id);
    if (deleteError) {
      throw new Error(`Error deleting judging entry: ${deleteError.message}`);
    }

    successfully_removed.push({ project_id, challenge_id });
  }

  return { successfully_removed, skipped };
};

const getChallengeJudgesForWinnerAssignmentService = async (
  judgingId: number,
  challengeId: number
) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("Please log in");

  const supabase = await createClient();

  const judgingRepository = new JudgingRepository(supabase);
  const judgingChallengesRepo = new JudgingChallengesRepository(supabase);
  const judging = await judgingRepository.findById(judgingId);

  if (judging.user_id !== user.id) {
    throw new Error("Unauthorized - You are not assigned to this judging");
  }

  const { data: judges, error: judgesError } =
    await judgingChallengesRepo.findJudgesByChallenge(challengeId);

  if (judgesError) throw new Error(judgesError.message);

  return judges.map((judge) => ({
    ...judge.judgings,
    is_winner_assigner: judge.is_winner_assigner,
  }));
};
const getChallengeProjectsForWinnerAssignmentService = async (
  judgingId: number,
  challengeId: number
) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) {
    throw new UnauthorizedError("Please log in");
  }

  const supabase = await createClient();
  const judgingRepository = new JudgingRepository(supabase);
  const judgingEntriesRepo = new JudgingEntriesRepository(supabase);

  // Check if judging exists and belongs to the user
  const judging = await judgingRepository.findById(judgingId);
  if (!judging) {
    throw new Error("Judging not found");
  }

  if (judging.user_id !== user.id) {
    throw new Error("Unauthorized - You are not assigned to this judging");
  }

  // Get projects + scores for the challenge
  const entries = await judgingEntriesRepo.findByChallengeId(challengeId);

  const customRound = (num: number) => {
    const decimal = num % 1;
    if (decimal < 0.5) return Math.floor(num);
    return Math.ceil(num);
  };

  // Transform into project map
  const projectMap = entries.reduce((acc, entry) => {
    if (!acc.has(entry.project_id)) {
      acc.set(entry.project_id, {
        ...entry.projects,
        judges_scores: [],
        average_score: 0,
      });
    }

    const projectData = acc.get(entry.project_id);

    // bot score
    projectData.judges_scores.push({
      judge_id: "bot",
      score: customRound(entry.judging_bot_scores?.score ?? 0),
    });

    // human judge score
    projectData.judges_scores.push({
      judge_id: entry.judging_id,
      judge_user_information: {
        id: entry.judgings?.users?.id,
        full_name: entry.judgings?.users?.full_name,
        avatar_url: entry.judgings?.users?.avatar_url,
      },
      score: customRound(entry.score),
    });

    const validScores = projectData.judges_scores.filter(
      (s: { score: number | null; judge_id: string | number }) =>
        s.score !== null && s.score !== undefined && s.judge_id !== "bot"
    );

    const averageScore = validScores.length
      ? customRound(
          validScores.reduce((sum: number, curr: { score: number }) => sum + curr.score, 0) /
            validScores.length
        )
      : 0;

    projectData.average_score = averageScore;

    return acc;
  }, new Map());

  return Array.from(projectMap.values()).sort((a, b) => b.average_score - a.average_score);
};

const getAssignWinnerButtonStatusService = async (judgingId: number) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("User not logged in");

  const supabase = await createClient();

  const judgingRepository = new JudgingRepository(supabase);
  const judgingChallengesRepository = new JudgingChallengesRepository(supabase);

  // verify judging belongs to user
  const judging = await judgingRepository.findById(judgingId);
  if (!judging) throw new BadRequestError("Judging not found");

  if (judging.user_id !== user.id) {
    throw new BadRequestError("Unauthorized - You are not assigned to this judging");
  }

  // fetch judging challenges where this user is winner assigner
  const { data: judgingChallenges, error: challengesError } =
    await judgingChallengesRepository.findWinnerAssignersByJudgingId(judgingId);

  if (challengesError || !judgingChallenges?.length) {
    return { status: false };
  }

  // check if winners are already submitted
  const allWinnersSubmitted = judgingChallenges.every(
    (challenge) => challenge.submitted_winners === true
  );

  if (allWinnersSubmitted) {
    return { status: "view-winners" };
  }

  return { status: true };
};

const getWinnerAssignerChallengesService = async (judgingId: number) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("User not logged in");

  const supabase = await createClient();
  const judgingRepository = new JudgingRepository(supabase);
  const judgingChallengesRepository = new JudgingChallengesRepository(supabase);
  const projectChallengesRepository = new ProjectChallengesRepository(supabase);

  // Check ownership
  const judging = await judgingRepository.findById(judgingId);
  if (!judging) throw new Error("Judging not found");

  if (judging.user_id !== user.id) {
    throw new Error("Unauthorized - You are not assigned to this judging");
  }

  // Fetch challenges where user is winner assigner
  const challenges = await judgingChallengesRepository.findWinnerAssignerChallenges(judgingId);

  const response = challenges.map((challenge: any) => ({
    ...challenge.hackathon_challenges,
    submitted_winners: challenge.submitted_winners,
  }));

  // Fetch related project-challenges for prizes
  const prizeIds = response.flatMap((item: any) => item.prizes.map((prize: any) => prize.id));

  const projectChallenges = await projectChallengesRepository.findByPrizeIds(prizeIds);

  // Map prize_id -> project_id
  const prizeToProjectMap =
    projectChallenges?.reduce((acc: Record<string, number>, pc: any) => {
      if (pc.prize_id) acc[pc.prize_id] = pc.project_id;
      return acc;
    }, {}) || {};

  // Attach winner_project_id to prizes
  response.forEach((item: any) => {
    item.prizes = item.prizes.map((prize: any) => ({
      ...prize,
      winner_project_id: prizeToProjectMap[prize.id] || null,
    }));
  });

  return response;
};

const assignWinnersForChallengesService = async (
  judgingId: number,
  winners: Array<{
    challenge_id: number;
    project_id: number;
    prize_id: number;
  }>
) => {
  if (!winners || !Array.isArray(winners) || winners.length === 0) {
    throw new BadRequestError("Winners array is required");
  }

  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("Please log in");

  const supabase = await createClient();

  const judgingRepo = new JudgingRepository(supabase);
  const projectChallengesRepo = new ProjectChallengesRepository(supabase);
  const judgingChallengesRepo = new JudgingChallengesRepository(supabase);

  // ownership check
  const judging = await judgingRepo.findById(judgingId);
  if (!judging) throw new BadRequestError("Judging not found");
  if (judging.user_id !== user.id) {
    throw new Error("Unauthorized - You are not assigned to this judging");
  }

  // prepare lookup arrays
  const challengeIds = [...new Set(winners.map((w) => w.challenge_id))];
  const projectIds = [...new Set(winners.map((w) => w.project_id))];
  const prizeIds = [...new Set(winners.map((w) => w.prize_id))];

  // validate project-challenge combos
  const projectChallenges = await projectChallengesRepo.findByChallengeIdsAndProjectIds(
    challengeIds,
    projectIds
  );

  const validSet = new Set(
    projectChallenges.map((pc: any) => `${pc.project_id}-${pc.challenge_id}`)
  );

  for (const w of winners) {
    const key = `${w.project_id}-${w.challenge_id}`;
    if (!validSet.has(key)) {
      throw new Error(`Project ${w.project_id} does not belong to challenge ${w.challenge_id}`);
    }
  }

  // validate prizes and get rank
  const { data: prizes, error: prizesError } = await supabase
    .from("hackathon_challenge_bounties")
    .select("id, challenge_id, rank")
    .in("challenge_id", challengeIds)
    .in("id", prizeIds);

  if (prizesError) {
    throw new Error(`Failed to validate prizes: ${prizesError.message}`);
  }

  const prizeMap = new Map(prizes.map((p: any) => [`${p.id}-${p.challenge_id}`, p]));

  const updates = winners.map((w) => {
    const prizeKey = `${w.prize_id}-${w.challenge_id}`;
    const prize = prizeMap.get(prizeKey);
    if (!prize) {
      throw new Error(
        `Prize ${w.prize_id} does not exist or does not belong to challenge ${w.challenge_id}`
      );
    }
    return {
      project_id: w.project_id,
      challenge_id: w.challenge_id,
      prize_id: w.prize_id,
      rank: prize.rank ?? null,
    };
  });

  // mark judging_challenges.submitted_winners = true for each challenge
  await judgingChallengesRepo.markSubmittedWinnersByChallengeIds(challengeIds);

  // update project_challenges with prize_id and rank
  const updateResults = await projectChallengesRepo.batchUpdateProjectChallenges(updates);

  // check for update errors
  const updateErrors = updateResults.filter((r: any) => r?.error);
  if (updateErrors.length > 0) {
    throw new Error(
      `Failed to update ${updateErrors.length} project challenge(s): ${
        updateErrors[0]?.error?.message ?? "Unknown error"
      }`
    );
  }

  return {
    success: true,
    message: `Successfully assigned winners for ${updates.length} project(s) across ${challengeIds.length} challenge(s)`,
  };
};

const assignWinnerAssignerService = async (
  challengeId: number,
  judgeId: number,
  isWinnerAssigner: boolean
) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("User not logged in");

  const supabase = await createClient();

  const judgingRepo = new JudgingRepository(supabase);
  const challengeRepo = new ChallengesRepository(supabase);
  const judgingChallengesRepo = new JudgingChallengesRepository(supabase);

  // 1. Validate challenge
  const challenge = await challengeRepo.findById(challengeId, ["hackathon_id"]);
  if (!challenge) throw new Error("Challenge not found");

  // TODO: Organizer/technology owner verification here

  // 3. Validate judge
  const judge = await judgingRepo.findById(judgeId);
  if (!judge) throw new Error("Judge not found");

  const assignment = await judgingChallengesRepo.findAssignment(judgeId, challengeId);
  if (!assignment) {
    throw new Error("Judge is not assigned to this challenge");
  }

  if (isWinnerAssigner) {
    await judgingChallengesRepo.clearExistingWinnerAssigner(challengeId);
  }

  return await judgingChallengesRepo.updateWinnerAssigner(judgeId, challengeId, isWinnerAssigner);
};

export {
  addJudgeToProjectsService,
  assignProjectsService,
  assignWinnersForChallengesService,
  createJudgingService,
  getAssignWinnerButtonStatusService,
  getChallengeJudgesForWinnerAssignmentService,
  getChallengeProjectsForWinnerAssignmentService,
  getJudgingChallengesService,
  getJudgingProgressService,
  getProjectsAJudgeIsJudgingService,
  getWinnerAssignerChallengesService,
  removeJudgeFromProjectsService,
  submitJudgingService,
  assignWinnerAssignerService,
};
