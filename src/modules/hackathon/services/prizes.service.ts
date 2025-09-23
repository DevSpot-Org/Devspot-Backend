import { createClient } from "@/lib/supabase";
import { PrizesRepository } from "../repositories/prizes.repository";
import { HackathonPrizesParams, HackathonPrizesResponse } from "../types";

export const getHackathonPrizesService = async (
  params: HackathonPrizesParams
): Promise<HackathonPrizesResponse> => {
  const supabase = await createClient();
  const prizesRepository = new PrizesRepository(supabase);

  const prizes = await prizesRepository.getHackathonPrizes(params.hackathon_id);

  return {
    prizes,
  };
};
