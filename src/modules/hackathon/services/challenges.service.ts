import { createClient } from "@/lib/supabase";
import { ChallengesRepository } from "../repositories/challenges.repository";
import {
  HackathonChallengesParams,
  HackathonChallengesResponse,
  SearchHackathonChallengesParams,
  SearchHackathonChallengesRequest,
  SearchHackathonChallengesResponse,
} from "../types";

export const getHackathonChallengesService = async (
  params: HackathonChallengesParams
): Promise<HackathonChallengesResponse> => {
  const supabase = await createClient();
  const challengesRepository = new ChallengesRepository(supabase);

  const challenges = await challengesRepository.getHackathonChallenges(params.hackathon_id);

  return {
    challenges,
  };
};

export const searchHackathonChallengesService = async (
  params: SearchHackathonChallengesParams,
  query: SearchHackathonChallengesRequest
): Promise<SearchHackathonChallengesResponse> => {
  const supabase = await createClient();
  const challengesRepository = new ChallengesRepository(supabase);

  const result = await challengesRepository.searchHackathonChallenges(
    params.hackathon_id,
    query.query,
    query.page,
    query.limit
  );

  return {
    challenges: result.challenges,
    total: result.total,
  };
};
