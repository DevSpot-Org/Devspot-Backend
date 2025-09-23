import { createClient } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/modules/auth/utils";
import { JudgingEntryRepository, JudgingRepository } from "../repositories";
import {
  GetHackathonJudgesSearchParams,
  GetJudgingPrizesParams,
  GetJudgingProjectsParams,
  GetJudgingProjectsUngroupedParams,
  GetUserJudgingsParams,
} from "../types";

const getUserJudgingsService = async (params: GetUserJudgingsParams) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  return await judgingRepository.getUserJudgings(params.user_id);
};

const getUserJudgingProjectsService = async (params: GetJudgingProjectsParams) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  await judgingRepository.checkJudgingOwnership(params.judging_id, params.user_id);

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  return await judgingEntryRepository.getJudgingProjects(params.judging_id);
};

const getUserJudgingProjectsUngroupedService = async (
  params: GetJudgingProjectsUngroupedParams
) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError) {
    throw new Error("Authentication failed");
  }

  const judgingRepository = new JudgingRepository(supabase);
  await judgingRepository.checkJudgingOwnership(params.judging_id, params.user_id);

  const judgingEntryRepository = new JudgingEntryRepository(supabase);
  return await judgingEntryRepository.getJudgingProjectsUngrouped(params.judging_id);
};

const getUserJudgingPrizesService = async (params: GetJudgingPrizesParams) => {
  const supabase = await createClient();
  const { user, error: authError } = await getAuthenticatedUser();
  if (authError) {
    throw new Error("Authentication failed");
  }

  const repository = new JudgingRepository(supabase);
  return await repository.getHackathonChallengesJudgesProgress(1, params.judging_id);
};

const getHackathonJudgesSearchService = async (params: GetHackathonJudgesSearchParams) => {
  const supabase = await createClient();
  const repository = new JudgingRepository(supabase);
  return await repository.getHackathonJudgesSearch(params.hackathon_id);
};

export {
  getHackathonJudgesSearchService,
  getUserJudgingPrizesService,
  getUserJudgingProjectsService,
  getUserJudgingProjectsUngroupedService,
  getUserJudgingsService,
};
