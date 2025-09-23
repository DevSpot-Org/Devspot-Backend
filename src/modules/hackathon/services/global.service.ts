import { createClient } from "@/lib/supabase";
import { GlobalRepository } from "../repositories/global.repository";
import {
  HackathonsRequest,
  HackathonsResponse,
  SearchHackathonsRequest,
  SearchHackathonsResponse,
  UserHackathonsParams,
  UserHackathonsResponse,
} from "../types";

export const searchHackathonsService = async (
  query: SearchHackathonsRequest
): Promise<SearchHackathonsResponse> => {
  const supabase = await createClient();
  const globalRepository = new GlobalRepository(supabase);

  const result = await globalRepository.searchHackathons(query.query, query.page, query.limit);

  return {
    hackathons: result.hackathons,
    total: result.total,
  };
};

export const getHackathonsService = async (
  query: HackathonsRequest
): Promise<HackathonsResponse> => {
  const supabase = await createClient();
  const globalRepository = new GlobalRepository(supabase);

  const result = await globalRepository.getHackathons(query.page, query.limit, query.status);

  return {
    hackathons: result.hackathons,
    total: result.total,
  };
};

export const getUserHackathonsService = async (
  params: UserHackathonsParams
): Promise<UserHackathonsResponse> => {
  const supabase = await createClient();
  const globalRepository = new GlobalRepository(supabase);

  const hackathons = await globalRepository.getUserHackathons(params.user_id);

  return { hackathons };
};
