import { BadRequestError, UnauthorizedError } from "@/lib/errorHandler";
import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { ProjectChallengesRepository } from "@/modules/projects/repositories/project-challenges.repository";
import { JudgingEntryRepository, JudgingRepository } from "../repositories";
import {
  FlagProjectRequest,
  GetProjectDetailsParams,
  GetProjectDetailsResponse,
  SubmitJudgingEntryParams,
  SubmitJudgingEntryRequest,
  SubmitJudgingEntryResponse,
  UpdateJudgingEntryParams,
  UpdateJudgingEntryRequest,
  UpdateJudgingEntryResponse,
} from "../types";

const getProjectDetailsService = async (
  params: GetProjectDetailsParams
): Promise<GetProjectDetailsResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(params.judging_id, user.id);

  if (!isOwner) {
    throw new Error("You are not authorized to view this judging");
  }

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  const entry = await judgingEntryRepository.getProjectDetails(
    params.judging_id,
    params.project_id,
    params.challenge_id
  );

  if (!entry) {
    throw new Error("Judging entry not found");
  }

  const canBeEdited = canBeEditedHelper(entry, entry.judging_bot_scores?.ai_judged || false);

  return {
    ...entry,
    can_be_edited: canBeEdited,
  };
};

const submitJudgingEntryService = async (
  params: SubmitJudgingEntryParams,
  body: SubmitJudgingEntryRequest
): Promise<SubmitJudgingEntryResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(params.judging_id, user.id);

  if (!isOwner) {
    throw new Error("You are not authorized to submit this judging entry");
  }

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  return await judgingEntryRepository.submitJudgingEntry({
    judging_id: params.judging_id,
    project_id: params.project_id,
    challenge_id: body.challenge_id,
    score: body.score,
    technical_feedback: body.technical_feedback,
    technical_score: body.technical_score,
    business_feedback: body.business_feedback,
    business_score: body.business_score,
    innovation_feedback: body.innovation_feedback,
    innovation_score: body.innovation_score,
    ux_feedback: body.ux_feedback,
    ux_score: body.ux_score,
    general_comments: body.general_comments,
  });
};

const updateJudgingEntryService = async (
  params: UpdateJudgingEntryParams,
  body: UpdateJudgingEntryRequest
): Promise<UpdateJudgingEntryResponse> => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(params.judging_id, user.id);

  if (!isOwner) {
    throw new Error("You are not authorized to update this judging entry");
  }

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  const updates: any = {};

  if (body.score !== undefined) updates.score = body.score;
  if (body.technical_feedback !== undefined) updates.technical_feedback = body.technical_feedback;
  if (body.business_feedback !== undefined) updates.business_feedback = body.business_feedback;
  if (body.innovation_feedback !== undefined)
    updates.innovation_feedback = body.innovation_feedback;
  if (body.ux_feedback !== undefined) updates.ux_feedback = body.ux_feedback;
  if (body.general_comments !== undefined) updates.general_comments = body.general_comments;
  if (body.judging_status !== undefined) updates.judging_status = body.judging_status;
  if (body.technical_score !== undefined) updates.technical_score = body.technical_score;
  if (body.business_score !== undefined) updates.business_score = body.business_score;
  if (body.innovation_score !== undefined) updates.innovation_score = body.innovation_score;
  if (body.ux_score !== undefined) updates.ux_score = body.ux_score;

  updates.updated_at = new Date().toISOString();

  return await judgingEntryRepository.updateJudgingEntry(
    params.judging_id,
    params.project_id,
    body.challenge_id,
    updates
  );
};

const flagProjectService = async (
  judging_id: number,
  project_id: number,
  body: FlagProjectRequest
) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new UnauthorizedError("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  const isOwner = await judgingRepository.checkJudgingOwnership(judging_id, user.id);

  if (!isOwner) {
    throw new Error("You are not authorized to flag this project");
  }

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  return await judgingEntryRepository.updateFlagStatus(
    judging_id,
    project_id,
    body.challenge_id,
    body.flag_reason,
    body.flag_comments,
    body.status
  );
};

const canBeEditedHelper = (entry: any, aiJudged: boolean): boolean => {
  if (aiJudged) {
    return entry.judging_status === "needs_review" && !entry.technical_feedback;
  }
  return entry.judging_status === "needs_review";
};

const getJudgeProjectSubmissionStatus = async (judgingId: number, challengeId: number) => {
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError || !user) throw new UnauthorizedError("User not logged in");

  const supabase = await createClient();
  const judgingRepository = new JudgingRepository(supabase);

  const judging = await judgingRepository.findById(judgingId);

  if (judging.user_id !== user.id) {
    throw new Error("Unauthorized - You are not assigned to this judging");
  }
  const projChallengesRepo = new ProjectChallengesRepository(supabase);

  const { data: projectChallenges, error: projectChallengesError } =
    await projChallengesRepo.findByChallengeId(challengeId);

  if (projectChallengesError || !projectChallenges) {
    throw new BadRequestError("Error fetching project challenges");
  }

  return projectChallenges.every(
    (project) => (project.projects as { submitted: boolean }).submitted
  );
};

export {
  flagProjectService,
  getProjectDetailsService,
  submitJudgingEntryService,
  updateJudgingEntryService,
  getJudgeProjectSubmissionStatus,
};
